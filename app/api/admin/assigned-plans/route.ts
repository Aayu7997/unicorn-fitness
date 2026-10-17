import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    
    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }

    const plans = await prisma.assignedPlan.findMany({
      where: { type },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Failed to fetch assigned plans:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const session = await getServerSession()
    
    // In a real app, you'd find the user by ID. 
    // If client sends userName, you might need to lookup.
    // For now we'll assume data.userId is provided, else fallback to a hardcoded or first user.
    let userId = data.userId
    if (!userId) {
      const firstUser = await prisma.user.findFirst()
      userId = firstUser?.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 })
    }

    const plan = await prisma.assignedPlan.create({
      data: {
        userId: userId,
        assignedById: (session?.user as any)?.id || userId,
        type: data.type, // 'diet' or 'workout'
        content: data.content || {},
      }
    })
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Failed to create plan:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
