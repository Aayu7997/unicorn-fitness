import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  workout: z.string().optional(),
  diet: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session?.id) throw new Error('UNAUTHORIZED')

    const { id: userId } = await params
    const body = await request.json()
    const parsed = schema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { workout, diet } = parsed.data

    // Handle Workout Plan
    if (workout !== undefined) {
      const existingWorkout = await prisma.assignedPlan.findFirst({
        where: { userId, type: 'workout', active: true }
      })

      if (existingWorkout) {
        await prisma.assignedPlan.update({
          where: { id: existingWorkout.id },
          data: { content: workout }
        })
      } else if (workout.trim() !== '') {
        await prisma.assignedPlan.create({
          data: {
            userId,
            assignedById: session.id,
            type: 'workout',
            content: workout,
            active: true
          }
        })
      }
    }

    // Handle Diet Plan
    if (diet !== undefined) {
      const existingDiet = await prisma.assignedPlan.findFirst({
        where: { userId, type: 'diet', active: true }
      })

      if (existingDiet) {
        await prisma.assignedPlan.update({
          where: { id: existingDiet.id },
          data: { content: diet }
        })
      } else if (diet.trim() !== '') {
        await prisma.assignedPlan.create({
          data: {
            userId,
            assignedById: session.id,
            type: 'diet',
            content: diet,
            active: true
          }
        })
      }
    }

    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })

  } catch (e: unknown) {
    console.error('Assign plan error:', e)
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
