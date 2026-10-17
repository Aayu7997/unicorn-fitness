import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json()
    const { category, description, amount, status, date } = data

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        category,
        description,
        amount: amount ? Number(amount) : undefined,
        status,
        date: date ? new Date(date) : undefined
      }
    })
    return NextResponse.json(expense)
  } catch (error: any) {
    console.error('Expense PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.expense.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Expense DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
