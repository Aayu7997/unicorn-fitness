import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function POST(req: Request) {
  try {
    const sessionAdmin = await requireAdmin()
    if (!sessionAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memberId, message } = await req.json()

    if (!memberId || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const notification = await prisma.notification.create({
      data: {
        userId: memberId,
        role: 'user',
        title: 'Special Offer Just For You',
        message: message,
        type: 'promo',
      }
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Send Promo Error:', error)
    return NextResponse.json({ error: 'Failed to send promo message' }, { status: 500 })
  }
}
