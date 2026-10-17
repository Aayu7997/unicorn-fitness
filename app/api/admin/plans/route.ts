import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  period: z.string().default('month'),
  description: z.string(),
  features: z.array(z.string()).default([]),
  popular: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

export async function GET() {
  try {
    await requireAdmin()
    const plans = await prisma.plan.findMany({ orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }] })
    revalidatePath('/', 'layout'); return NextResponse.json(plans)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    const plan = await prisma.plan.create({ data: parsed.data })
    revalidatePath('/', 'layout'); return NextResponse.json(plan, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
