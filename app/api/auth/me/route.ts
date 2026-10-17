import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const sessionUser = await getSession()

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await (prisma.user as any).findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        height: true,
        age: true,
        gender: true,
        avatarUrl: true,
        authProvider: true,
        passwordLastChangedAt: true,
        twoFactorEnabled: true,
        googleFitConnected: true,
        samsungHealthConnected: true,
        fitnessDataSyncedAt: true,
        progressLogs: {
          orderBy: { date: 'desc' },
          take: 5
        },
        membership: {
          select: {
            status: true,
            endDate: true,
            plan: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
