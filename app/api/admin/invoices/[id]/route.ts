import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json()
    const { amount, status, planName, date } = data

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        amount: amount ? Number(amount) : undefined,
        status,
        planName,
        date: date ? new Date(date) : undefined
      }
    })
    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error('Invoice PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.invoice.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Invoice DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
