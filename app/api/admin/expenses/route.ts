import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    })
    
    const formatted = expenses.map(exp => ({
      ...exp,
      date: exp.date.toISOString().split('T')[0]
    }))
    
    return NextResponse.json(formatted)
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Expenses GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const data = await req.json()
    const { category, description, amount, status, date } = data

    if (!category || !description || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount: Number(amount),
        status: status || 'Paid',
        date: date ? new Date(date) : undefined
      }
    })
    return NextResponse.json(expense)
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Expenses POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
