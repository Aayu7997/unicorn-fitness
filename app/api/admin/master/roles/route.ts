import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { getClientIp } from '@/lib/rate-limit'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const roles = await prisma.staffRole.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    const rolesWithCounts = await Promise.all(roles.map(async (r) => {
      const count = await prisma.user.count({ where: { customRole: r.name } })
      return { ...r, usersCount: count }
    }))
    
    return NextResponse.json(rolesWithCounts)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const { name, description, permissions } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    const role = await prisma.staffRole.create({
      data: {
        name: name.trim(),
        description,
        permissions: permissions || {}
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        resource: 'Role',
        details: `Created role "${name}"`,
        ip: getClientIp(request.headers),
        device: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json(role)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
