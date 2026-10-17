import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  specialty: z.string().min(1),
  experience: z.string().min(1),
  bio: z.string().min(1),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

export async function GET() {
  try {
    await requireAdmin()
    const trainers = await prisma.trainer.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })
    revalidatePath('/', 'layout'); return NextResponse.json(trainers)
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
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    const trainer = await prisma.trainer.create({ data: parsed.data })
    revalidatePath('/', 'layout'); return NextResponse.json(trainer, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
