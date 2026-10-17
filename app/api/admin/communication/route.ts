import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(req: Request) {
  try {
    await requireAdmin()
    
    // Fetch system notifications/broadcast campaigns
    const notifications = await prisma.notification.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    })

    const totalMembers = await prisma.user.count({ where: { role: 'user' } })

    const campaigns = notifications.map(n => ({
      id: n.id,
      title: n.title,
      type: n.type === 'info' ? 'Push App' : 'Email',
      audience: n.role ? 'Specific Role' : 'All Members',
      sent: n.role ? 1 : totalMembers, // Use real member count for broadcast campaigns
      openRate: n.isRead ? '100%' : '0%',
      status: 'Completed',
      date: new Date(n.createdAt).toLocaleDateString()
    }))

    return NextResponse.json(campaigns)
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error?.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Failed to fetch communications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const data = await req.json()
    if (!data.title || !data.type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
    }

    let nType = 'system'
    if (data.type === 'Push App') nType = 'info'
    if (data.type === 'WhatsApp') nType = 'success'
    if (data.type === 'Email') nType = 'system'

    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message || `Campaign sent via ${data.type} to ${data.audience || 'All Members'}`,
        type: nType,
        role: data.audience === 'All Members' ? null : data.audience === 'Inactive Members' ? 'user' : 'user'
      }
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Failed to create communication:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
