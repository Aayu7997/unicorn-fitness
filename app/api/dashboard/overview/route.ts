import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.id

    // Fetch user with necessary relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        membership: {
          include: {
            plan: true
          }
        },
        progressLogs: {
          orderBy: { date: 'desc' },
          take: 1
        },
        programs: {
          take: 3
        },
        notifications: {
          where: { type: { in: ['proactive_ai', 'promo'] } },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        classBookings: {
          include: {
            classSchedule: true
          },
          orderBy: {
            classSchedule: {
              createdAt: 'desc'
            }
          },
          take: 3
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const workoutsCount = await prisma.progressLog.count({ where: { userId } })
    const totalBookings = await prisma.classBooking.count({ where: { userId } })
    const totalWorkouts = workoutsCount + totalBookings

    // Calculate real stats based on user data
    const age = user.age || 30
    const height = user.height || 170 // cm
    const weight = user.progressLogs[0]?.weight || 70 // kg
    const gender = (user.gender || 'male').toLowerCase()

    // Basal Metabolic Rate (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age)
    bmr += (gender === 'female') ? -161 : 5

    // Activity multiplier based on workouts (1.2 sedentary to 1.9 extremely active)
    const activityMultiplier = Math.min(1.2 + (totalWorkouts * 0.05), 1.9)
    const dailyCalories = Math.floor(bmr * activityMultiplier)
    
    // Total estimated calories burned (let's say 30 days of data)
    const estimatedMonthlyCalories = dailyCalories * 30

    const responseData = {
      membership: user.membership ? {
        status: user.membership.status,
        planName: user.membership.plan.name,
        endDate: user.membership.endDate,
        memberId: user.id.slice(-8).toUpperCase()
      } : null,
      stats: {
        workouts: totalWorkouts,
        calories: estimatedMonthlyCalories,
        hours: totalWorkouts * 1.5,
        trophies: Math.floor(totalWorkouts / 3)
      },
      currentWeight: user.progressLogs[0]?.weight || null,
      activePrograms: user.programs,
      upcomingClasses: user.classBookings.map(b => b.classSchedule),
      coachMessage: user.notifications.find(n => n.type === 'proactive_ai')?.message || null,
      promoMessage: user.notifications.find(n => n.type === 'promo')?.message || null
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Overview fetch error:', error)
    return NextResponse.json({ error: String(error), stack: (error as Error).stack }, { status: 500 })
  }
}