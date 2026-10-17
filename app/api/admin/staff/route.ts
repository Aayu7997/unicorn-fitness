import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          not: 'user'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRole: true,
        avatarUrl: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, role, avatarUrl } = body

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'admin',
        customRole: role, // 'trainer', 'manager', etc.
        avatarUrl,
        passwordHash: 'defaultPassword123'
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
