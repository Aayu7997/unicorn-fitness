import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { user: { role: 'user' } },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' }
    })
    
    // Format response to match the UI requirements
    const formatted = invoices.map(inv => ({
      id: inv.id,
      date: inv.date.toISOString().split('T')[0],
      member: inv.user?.name || 'Unknown',
      plan: inv.planName,
      amount: inv.amount,
      status: inv.status,
      userId: inv.userId
    }))
    
    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error('Invoices GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { userId, amount, status, planName, date } = data

    if (!userId || !amount || !planName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        amount: Number(amount),
        status: status || 'Paid',
        planName,
        date: date ? new Date(date) : undefined
      }
    })
    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error('Invoices POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
