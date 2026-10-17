import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    
    const items = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(items)
  } catch (error) {
    console.error('Failed to fetch inventory:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const item = await prisma.inventoryItem.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantity: Number(data.quantity) || 0,
        price: Number(data.price) || 0,
        status: data.status || 'In Stock',
      }
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Failed to create inventory item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
