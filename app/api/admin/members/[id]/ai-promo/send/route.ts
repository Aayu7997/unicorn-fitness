import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { Resend } from 'resend'
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { message, type } = body

    if (!message || !type) {
      return NextResponse.json({ error: 'Message and type are required' }, { status: 400 })
    }

    const resolvedParams = await params;
    const memberId = resolvedParams.id;
    
    // Fetch member details
    const member = await prisma.user.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // 1. Create In-App Notification
    await prisma.notification.create({
      data: {
        userId: memberId,
        title: type === 'Renewal Reminder' ? 'Membership Renewal Reminder' : 'Special Offer for You!',
        message: message,
        type: type === 'Renewal Reminder' ? 'alert' : 'promo'
      }
    })

    // 2. Send Real Email via Resend
    if (member.email && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'UFC GYM <onboarding@resend.dev>', // Use verified domain in prod
        to: member.email,
        subject: type === 'Renewal Reminder' ? 'A quick reminder regarding your membership' : 'A Special Offer from UFC GYM',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
              <h1 style="color: #f97316; margin: 0;">UFC GYM</h1>
            </div>
            <div style="padding: 30px; border: 1px solid #eee;">
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        `
      })
    }

    revalidatePath('/', 'layout'); return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('AI Promo Send Error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
