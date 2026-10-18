import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, customRole: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to recent 100 logs for performance
    })

    const formattedLogs = logs.map(l => ({
      id: l.id,
      user: l.user?.name || 'Unknown',
      role: l.user?.customRole || l.user?.role || 'Unknown',
      action: l.action,
      resource: l.resource,
      details: l.details,
      ip: l.ip || 'Unknown',
      device: l.device || 'Unknown',
      timestamp: l.createdAt.toISOString(),
      status: 'Success'
    }))

    return NextResponse.json(formattedLogs)
  } catch (error: any) {
    const msg = error?.message
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
