import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverUrl: z.string().optional(),
  coverPublicId: z.string().optional(),
  published: z.boolean().default(false),
  author: z.string().default('Unicorn Fitness Club'),
  tags: z.array(z.string()).default([]),
})

export async function GET() {
  try {
    await requireAdmin()
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
    revalidatePath('/', 'layout'); return NextResponse.json(posts)
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
    const post = await prisma.blogPost.create({ data: parsed.data })
    revalidatePath('/', 'layout'); return NextResponse.json(post, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if ((e as { code?: string })?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
