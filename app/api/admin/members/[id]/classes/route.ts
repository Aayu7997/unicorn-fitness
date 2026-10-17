import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id: userId } = await context.params

    const classes = await prisma.classSchedule.findMany({
      where: { active: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { time: 'asc' }
      ]
    })

    const userBookings = await prisma.classBooking.findMany({
      where: { userId },
      select: { classScheduleId: true }
    })

    const bookedIds = userBookings.map(b => b.classScheduleId)

    revalidatePath('/', 'layout'); return NextResponse.json({ classes, bookedIds })
  } catch (error) {
    console.error('Failed to fetch user classes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id: userId } = await context.params
    const { classId, action } = await request.json()

    if (!classId || !action) {
      return NextResponse.json({ error: 'Missing classId or action' }, { status: 400 })
    }

    if (action === 'book') {
      const schedule = await prisma.classSchedule.findUnique({ where: { id: classId } })
      if (!schedule) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

      if (schedule.bookedCount >= schedule.capacity) {
        return NextResponse.json({ error: 'Class is full' }, { status: 400 })
      }

      await prisma.classBooking.create({
        data: { userId, classScheduleId: classId }
      })

      await prisma.classSchedule.update({
        where: { id: classId },
        data: { bookedCount: { increment: 1 } }
      })
      
      revalidatePath('/', 'layout'); return NextResponse.json({ success: true, message: 'Class booked' })
    } 
    else if (action === 'unbook') {
      await prisma.classBooking.delete({
        where: {
          userId_classScheduleId: {
            userId,
            classScheduleId: classId
          }
        }
      })

      await prisma.classSchedule.update({
        where: { id: classId },
        data: { bookedCount: { decrement: 1 } }
      })

      revalidatePath('/', 'layout'); return NextResponse.json({ success: true, message: 'Class unbooked' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Already booked' }, { status: 400 })
    }
    console.error('Failed to update class booking:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
