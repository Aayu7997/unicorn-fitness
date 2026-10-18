import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
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
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Advisory PUT Error:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Advisory session not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update advisory session' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params;
    await prisma.advisorySession.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Advisory DELETE Error:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Advisory session not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete advisory session' }, { status: 500 })
  }
}
