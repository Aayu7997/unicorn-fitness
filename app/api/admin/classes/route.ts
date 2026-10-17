import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    
    const classes = await prisma.classSchedule.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(classes)
  } catch (error) {
    console.error('Failed to fetch classes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
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
  } catch (error) {
    console.error('Failed to create class:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
