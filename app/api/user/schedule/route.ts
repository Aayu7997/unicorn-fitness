import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const classes = await prisma.classSchedule.findMany({
      where: { active: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { time: 'asc' }
      ]
    })

    const userBookings = await prisma.classBooking.findMany({
      where: { userId: session.id },
      select: { classScheduleId: true }
    })

    const bookedIds = new Set(userBookings.map(b => b.classScheduleId))

    return NextResponse.json({ classes, bookedIds: Array.from(bookedIds) })
  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { classId } = await request.json()
    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    // Check capacity and existence
    const classSchedule = await prisma.classSchedule.findUnique({ where: { id: classId } })
    if (!classSchedule) return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    if (classSchedule.bookedCount >= classSchedule.capacity) {
      return NextResponse.json({ error: 'Class is full' }, { status: 400 })
    }

    // Add booking
    const booking = await prisma.classBooking.create({
      data: {
        userId: session.id,
        classScheduleId: classId
      }
    })

    // Increment count
    await prisma.classSchedule.update({
      where: { id: classId },
      data: { bookedCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true, booking })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: '- booked' }, { status: 400 })
    }
    console.error('Schedule book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}