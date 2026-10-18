import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const staffCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Staff role is required'),
  avatarUrl: z.string().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
})

export async function GET() {
  try {
    await requireAdmin()
    const staff = await prisma.user.findMany({
      where: {
        role: 'admin'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRole: true,
        avatarUrl: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(staff)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const parsed = staffCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { name, email, role, avatarUrl, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    const initialPassword = password || crypto.randomUUID()
    const passwordHash = await hashPassword(initialPassword)

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        role: 'admin',
        customRole: role,
        avatarUrl: avatarUrl || null,
        passwordHash,
        mustChangePassword: !password,
        membershipId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRole: true,
        avatarUrl: true,
        createdAt: true,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
