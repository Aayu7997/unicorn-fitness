import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params;
    const data = await req.json()
    const { name, category, quantity, price, status } = data

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        category,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        price: price !== undefined ? Number(price) : undefined,
        status,
      }
    })
    return NextResponse.json(item)
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Inventory PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params;
    await prisma.inventoryItem.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Inventory DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
