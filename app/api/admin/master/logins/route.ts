import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const sessions = await prisma.session.findMany({
      include: {
        user: { select: { name: true, customRole: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to recent 100 logins
    })

    const formattedLogins = sessions.map(s => ({
      id: s.id,
      user: s.user?.name || 'Unknown',
      role: s.user?.customRole || s.user?.role || 'Unknown',
      ip: s.ip || 'Unknown',
      device: s.device || 'Unknown',
      timestamp: s.createdAt.toISOString(),
      status: 'Active'
    }))

    return NextResponse.json(formattedLogins)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to fetch login history' }, { status: 500 })
  }
}
