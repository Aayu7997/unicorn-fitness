import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    })
    
    const formatted = expenses.map(exp => ({
      ...exp,
      date: exp.date.toISOString().split('T')[0]
    }))
    
    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error('Expenses GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
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
    console.error('Expenses POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
