import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const status = request.nextUrl.searchParams.get('status')
    const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20')

    const where = status ? { status: status as 'new' | 'read' | 'replied' | 'closed' } : {}

    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactInquiry.count({ where }),
    ])

    const newCount = await prisma.contactInquiry.count({ where: { status: 'new' } })

    return NextResponse.json({ inquiries, total, page, limit, newCount })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
