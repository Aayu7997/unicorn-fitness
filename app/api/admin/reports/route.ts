import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { getPeriodDateRange } from '@/lib/admin-period'

export async function GET(req: Request) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '6m'
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const { startDate: periodStart, endDate: periodEnd, label: periodLabel } = getPeriodDateRange(
      period,
      { from: fromParam, to: toParam }
    )

    const dateFilter = period === 'all' ? {} : { date: { gte: periodStart, lte: periodEnd } }

    const expenses = await prisma.expense.findMany({
      where: dateFilter,
      orderBy: { date: 'desc' }
    })
    
    const invoices = await prisma.invoice.findMany({
      where: {
        ...dateFilter,
        user: { role: 'user' }
      },
      orderBy: { date: 'desc' }
    })

    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amount, 0)
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    
    const pendingDues = invoices.filter(inv => inv.status === 'Pending').reduce((acc, inv) => acc + inv.amount, 0)

    // Format Transactions
    const transactions = []
    
    for (const inv of invoices) {
      transactions.push({
        id: `inv_${inv.id}`,
        date: new Date(inv.date).toLocaleDateString(),
        description: `${inv.planName} - Invoice`,
        type: 'Income',
        amount: `₹${inv.amount.toLocaleString('en-IN')}`,
        method: 'System'
      })
    }

    for (const exp of expenses) {
      transactions.push({
        id: `exp_${exp.id}`,
        date: new Date(exp.date).toLocaleDateString(),
        description: exp.description,
        type: 'Expense',
        amount: `₹${exp.amount.toLocaleString('en-IN')}`,
        method: 'System'
      })
    }

    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      metrics: {
        totalRevenue: totalRevenue || 0,
        totalExpenses: totalExpenses || 0,
        netProfit: netProfit || 0,
        pendingDues: pendingDues || 0
      },
      transactions: transactions.slice(0, 50)
    })
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Failed to fetch reports:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
