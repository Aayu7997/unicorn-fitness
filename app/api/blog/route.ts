import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverUrl: true, author: true, tags: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(posts, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
