import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(req: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    
    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }

    const plans = await prisma.assignedPlan.findMany({
      where: { type, user: { role: 'user' } },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(plans)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Failed to fetch assigned plans:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const data = await req.json()
    
    const userId = data.userId
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.role !== 'user') {
      return NextResponse.json({ error: 'Plans can only be assigned to gym members, not administrators.' }, { status: 400 })
    }

    const plan = await prisma.assignedPlan.create({
      data: {
        userId: targetUser.id,
        assignedById: adminUser.id,
        type: data.type || 'workout',
        content: data.content || {},
      }
    })
    return NextResponse.json(plan)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Failed to create plan:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
