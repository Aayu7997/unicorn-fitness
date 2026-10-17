import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = { id: 'dummy-admin-id', role: 'admin' }
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
      status: 'Success' // Assuming all stored audit logs are successes, or we could add a status field
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
