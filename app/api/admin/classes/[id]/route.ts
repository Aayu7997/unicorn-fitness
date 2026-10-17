import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    
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
    console.error('Failed to delete class:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
