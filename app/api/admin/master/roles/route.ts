import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = { id: 'dummy-admin-id', role: 'admin' }
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const roles = await prisma.staffRole.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // We also need to count how many users have this role
    // Since users store role in `customRole` as a string (role name or id)
    // we can do a query to count.
    const rolesWithCounts = await Promise.all(roles.map(async (r) => {
      const count = await prisma.user.count({ where: { customRole: r.name } })
      return { ...r, usersCount: count }
    }))
    
    return NextResponse.json(rolesWithCounts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = { id: 'dummy-admin-id', role: 'admin' }
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, permissions } = body

    const role = await prisma.staffRole.create({
      data: {
        name,
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
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
        device: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
