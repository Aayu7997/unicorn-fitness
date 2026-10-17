import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth'

const schema = z.object({
  name: z.string().optional(),
  phone: z.string().optional().nullable(),
  memberId: z.string().optional().nullable(),
  role: z.enum(['admin', 'user']).optional(),
  password: z.string().min(8).optional(),
  age: z.coerce.number().optional().nullable(),
  height: z.coerce.number().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  programIds: z.array(z.string()).optional(),
  newPlanId: z.string().optional().nullable(),
  cancelMembership: z.boolean().optional(),
  avatarUrl: z.string().optional().nullable(),
  avatarPublicId: z.string().optional().nullable(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, phone: true, memberId: true, role: true, createdAt: true,
        age: true, height: true, avatarUrl: true, avatarPublicId: true,
        membership: {
          include: { plan: { select: { id: true, name: true, price: true } } },
        },
        programs: { select: { id: true } },
        progressLogs: { orderBy: { date: 'desc' }, take: 1, select: { weight: true } },
        assignedPlans: { where: { active: true }, select: { type: true, content: true } }
      },
    })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    revalidatePath('/', 'layout'); return NextResponse.json(user)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
    const { id } = await params
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    
    const { password, weight, programIds, newPlanId, cancelMembership, ...data } = parsed.data
    const updateData: any = { ...data }
    
    if (password) {
      updateData.passwordHash = await hashPassword(password)
      updateData.mustChangePassword = false
    }

    if (programIds !== undefined) {
      updateData.programs = {
        set: programIds.map(pid => ({ id: pid }))
      }
    }

    if (weight !== undefined && weight !== null) {
      updateData.progressLogs = {
        create: {
          weight: weight
        }
      }
    }

    // Handle Membership Changes
    if (cancelMembership) {
      const currentUser = await prisma.user.findUnique({ where: { id }, select: { membershipId: true } })
      if (currentUser?.membershipId) {
        await prisma.membership.update({
          where: { id: currentUser.membershipId },
          data: { status: 'cancelled' }
        })
      }
    } else if (newPlanId) {
      const plan = await prisma.plan.findUnique({ where: { id: newPlanId } })
      if (plan) {
        const currentUser = await prisma.user.findUnique({ where: { id }, select: { membershipId: true } })
        if (currentUser?.membershipId) {
          await prisma.membership.update({
            where: { id: currentUser.membershipId },
            data: { status: 'cancelled' }
          })
        }

        const startDate = new Date()
        const endDate = new Date()
        if (plan.period === 'year') {
          endDate.setFullYear(endDate.getFullYear() + 1)
        } else {
          endDate.setMonth(endDate.getMonth() + 1)
        }
        
        const newMembership = await prisma.membership.create({
          data: {
            planId: plan.id,
            startDate,
            endDate,
            status: 'active'
          }
        })
        
        updateData.membershipId = newMembership.id
      }
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true },
    })
    revalidatePath('/', 'layout'); return NextResponse.json(user)
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
    const { id } = await params
    await prisma.user.delete({ where: { id } })
    revalidatePath('/', 'layout'); return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}