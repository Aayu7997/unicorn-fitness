import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(req: Request) {
  try {
    await requireAdmin()
    
    const classes = await prisma.classSchedule.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(classes)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Failed to fetch classes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const data = await req.json()
    const newClass = await prisma.classSchedule.create({
      data: {
        name: data.title,
        trainer: data.instructor,
        time: data.time,
        dayOfWeek: data.day,
        capacity: Number(data.capacity) || 20,
        room: data.location || 'Main Floor',
      }
    })
    return NextResponse.json(newClass)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Failed to create class:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
