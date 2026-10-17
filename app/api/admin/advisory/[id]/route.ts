import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json()
    const { topic, advisor, status, date } = data

    const session = await prisma.advisorySession.update({
      where: { id },
      data: {
        topic,
        advisor,
        status,
        date: date ? new Date(date) : undefined
      }
    })
    return NextResponse.json(session)
  } catch (error: any) {
    console.error('Advisory PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.advisorySession.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Advisory DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
