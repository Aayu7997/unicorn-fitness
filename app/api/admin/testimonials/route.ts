import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
  transformation: z.string().optional(),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  approved: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const pending = request.nextUrl.searchParams.get('pending') === 'true'
    const testimonials = await prisma.testimonial.findMany({
      where: pending ? { approved: false } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    revalidatePath('/', 'layout'); return NextResponse.json(testimonials)
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
    const testimonial = await prisma.testimonial.create({ data: parsed.data })
    revalidatePath('/', 'layout'); return NextResponse.json(testimonial, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
