import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { getClientIp } from '@/lib/rate-limit'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { name, description, permissions } = body

    const oldRole = await prisma.staffRole.findUnique({ where: { id } })
    if (!oldRole) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

    const role = await prisma.staffRole.update({
      where: { id },
      data: { name, description, permissions }
    })

    if (oldRole && oldRole.name !== name) {
      await prisma.user.updateMany({
        where: { customRole: oldRole.name },
        data: { customRole: name }
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        resource: 'Role',
        details: `Updated role "${name}"`,
        ip: getClientIp(request.headers),
        device: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json(role)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin()
    const { id } = await params

    const role = await prisma.staffRole.findUnique({ where: { id } })
    if (role) {
      await prisma.staffRole.delete({ where: { id } })
      
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE',
          resource: 'Role',
          details: `Deleted role "${role.name}"`,
          ip: getClientIp(request.headers),
          device: request.headers.get('user-agent') || 'Unknown',
        }
      })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
