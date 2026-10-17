import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const user = { id: 'dummy-admin-id', role: 'admin' }
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const record = await prisma.siteContent.findUnique({
      where: { key }
    })
    return NextResponse.json(record?.content || {})
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const user = { id: 'dummy-admin-id', role: 'admin' }
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
        device: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json(record.content)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
