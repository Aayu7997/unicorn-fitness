import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const sessions = await prisma.advisorySession.findMany({
      where: { user: { role: 'user' } },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { date: 'asc' }
    })
    
    const formatted = sessions.map((s: any) => ({
      id: s.id,
      date: s.date.toISOString().split('T')[0],
      member: s.user?.name || s.user?.email || 'Unknown',
      topic: s.topic,
      advisor: s.advisor,
      status: s.status,
      userId: s.userId
    }))
    
    return NextResponse.json(formatted)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Advisory GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const data = await req.json()
    const { userId, topic, advisor, status, date } = data

    if (!userId || !topic || !advisor) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const session = await prisma.advisorySession.create({
      data: {
        userId,
        topic,
        advisor,
        status: status || 'Upcoming',
        date: date ? new Date(date) : undefined
      }
    })
    return NextResponse.json(session)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Advisory POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
