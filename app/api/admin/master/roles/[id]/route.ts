import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = { id: 'dummy-admin-id', role: 'admin' }
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, permissions } = body

    const oldRole = await prisma.staffRole.findUnique({ where: { id } })

    const role = await prisma.staffRole.update({
      where: { id },
      data: { name, description, permissions }
    })

    if (oldRole && oldRole.name !== name) {
      // Update any users that had the old role string to the new role string
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
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
        device: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = { id: 'dummy-admin-id', role: 'admin' }
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const role = await prisma.staffRole.findUnique({ where: { id } })
    if (role) {
      await prisma.staffRole.delete({ where: { id } })
      
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE',
          resource: 'Role',
          details: `Deleted role "${role.name}"`,
          ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
          device: request.headers.get('user-agent') || 'Unknown',
        }
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
