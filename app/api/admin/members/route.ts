import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  membershipId: z.string().optional().nullable(),
  memberId: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const search = request.nextUrl.searchParams.get('search') ?? ''
    const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20')

    // STRICT ROLE SEPARATION: Members are strictly users with role 'user'.
    // Administrators are staff and must NEVER be queried or shown in member rosters.
    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        } : {},
        { role: Role.user },
      ],
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          memberId: true,
          role: true,
          createdAt: true,
          membership: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              plan: { select: { name: true, price: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    revalidatePath('/', 'layout'); return NextResponse.json({ users, total, page, limit })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

    const { password, ...data } = parsed.data
    const passwordHash = await hashPassword(password ?? 'ChangeMe@123!')

    // Members created here are always role: 'user'. Admins/staff are created in Staff Management.
    const user = await prisma.user.create({
      data: { ...data, role: Role.user, passwordHash, mustChangePassword: !password },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    revalidatePath('/', 'layout'); return NextResponse.json(user, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if ((e as { code?: string })?.code === 'P2002') return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

