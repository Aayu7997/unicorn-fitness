import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const programSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
  level: z.string().min(1),
  trainer: z.string().min(1),
  price: z.number().min(0),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

export async function GET() {
  try {
    await requireAdmin()
    const programs = await prisma.program.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })
    revalidatePath('/', 'layout'); return NextResponse.json(programs)
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
    const body = await request.json()
    const parsed = programSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    const program = await prisma.program.create({ data: parsed.data })
    revalidatePath('/', 'layout'); return NextResponse.json(program, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if ((e as { code?: string })?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
