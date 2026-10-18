import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { getClientIp } from '@/lib/rate-limit'

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    await requireAdmin()
    const { key } = await params

    const record = await prisma.siteContent.findUnique({
      where: { key }
    })
    return NextResponse.json(record?.content || {})
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const user = await requireAdmin()
    const { key } = await params

    const body = await request.json()
    const record = await prisma.siteContent.upsert({
      where: { key },
      update: { content: body.value || body },
      create: { key, content: body.value || body }
    })
    
    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        resource: `MasterConfig:${key}`,
        details: `Updated ${key} configuration`,
        ip: getClientIp(request.headers),
        device: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json(record.content)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
