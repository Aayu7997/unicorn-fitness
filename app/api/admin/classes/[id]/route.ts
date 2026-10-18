import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    
    const { id } = await params;

    const classExists = await prisma.classSchedule.findUnique({
      where: { id }
    })

    if (!classExists) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    await prisma.classBooking.deleteMany({
      where: { classScheduleId: id }
    })

    await prisma.classSchedule.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Failed to delete class:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
