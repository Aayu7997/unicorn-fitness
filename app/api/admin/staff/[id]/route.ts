import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { PRIMARY_ADMIN_EMAIL } from '@/lib/auth'
import { z } from 'zod'

const staffUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.string().min(1).optional(),
  avatarUrl: z.string().optional().nullable(),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const parsed = staffUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { name, email, role, avatarUrl } = parsed.data

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    if (targetUser.role !== 'admin') {
      return NextResponse.json({ error: 'Target user is not an administrative staff member' }, { status: 400 })
    }

    const targetEmail = targetUser.email.toLowerCase().trim()
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined
    if (targetEmail === PRIMARY_ADMIN_EMAIL && normalizedEmail && normalizedEmail !== PRIMARY_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'The primary system administrator email cannot be modified' }, { status: 403 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        ...(role ? { customRole: role } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRole: true,
        avatarUrl: true,
      }
    })

    return NextResponse.json(user)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentAdmin = await requireAdmin()
    const { id } = await params

    if (currentAdmin.id === id) {
      return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    if (targetUser.role !== 'admin') {
      return NextResponse.json({ error: 'Target user is not an administrative staff member' }, { status: 400 })
    }

    const targetEmail = targetUser.email.toLowerCase().trim()
    if (targetEmail === PRIMARY_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'The primary system administrator account cannot be deleted' }, { status: 403 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 })
  }
}
