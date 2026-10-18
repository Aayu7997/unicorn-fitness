import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
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
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Invoice PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params;
    await prisma.invoice.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Invoice DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
