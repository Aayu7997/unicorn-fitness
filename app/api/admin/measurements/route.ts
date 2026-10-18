import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const measurements = await prisma.progressLog.findMany({
      where: { user: { role: 'user' } },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { date: 'desc' }
    })
    
    const formatted = measurements.map(m => ({
      id: m.id,
      date: m.date.toISOString().split('T')[0],
      member: m.user?.name || m.user?.email || 'Unknown',
      weight: m.weight ? `${m.weight}kg` : '-',
      bodyFat: m.bodyFat ? `${m.bodyFat}%` : '-',
      muscleMass: m.muscleMass ? `${m.muscleMass}kg` : '-',
      goal: m.goal || 'None',
      userId: m.userId
    }))
    
    return NextResponse.json(formatted)
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Measurements GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const data = await req.json()
    const { userId, weight, bodyFat, muscleMass, goal, date } = data

    if (!userId || !weight) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const targetMember = await prisma.user.findFirst({
      where: { id: userId, role: 'user' },
      select: { id: true }
    })
    if (!targetMember) {
      return NextResponse.json({ error: 'Measurements can only be added for gym members' }, { status: 400 })
    }

    const measurement = await prisma.progressLog.create({
      data: {
        userId,
        weight: Number(weight),
        bodyFat: bodyFat ? Number(bodyFat) : null,
        muscleMass: muscleMass ? Number(muscleMass) : null,
        goal,
        date: date ? new Date(date) : undefined
      }
    })
    return NextResponse.json(measurement)
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Measurements POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
