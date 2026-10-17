import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = { id: 'dummy-admin-id', role: 'admin' }
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
      status: 'Active' // We can determine status based on expiresAt
    }))

    return NextResponse.json(formattedLogins)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch login history' }, { status: 500 })
  }
}
