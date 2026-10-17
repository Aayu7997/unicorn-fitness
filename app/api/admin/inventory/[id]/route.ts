import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    console.error('Inventory PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.inventoryItem.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Inventory DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
