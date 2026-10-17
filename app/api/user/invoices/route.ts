import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.id },
      orderBy: { date: 'desc' }
    })

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        membership: {
          include: { plan: true }
        }
      }
    })

    return NextResponse.json({ 
      invoices,
      membership: user?.membership ? {
        planName: user.membership.plan.name,
        status: user.membership.status,
        price: user.membership.plan.price,
        period: user.membership.plan.period,
        nextBilling: user.membership.endDate
      } : null
    })
  } catch (error) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}