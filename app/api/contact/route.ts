import { prisma } from '@/lib/prisma'
import { sendContactNotification } from '@/lib/resend'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required').max(254),
  phone: z.string().max(25).optional(),
  subject: z.string().min(3, 'Subject is required').max(150),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rateCheck = checkRateLimit(`contact:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait a few minutes before submitting again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const inquiry = await prisma.contactInquiry.create({
      data: parsed.data,
    })

    // Send email notification (non-blocking)
    sendContactNotification(parsed.data).catch(console.error)

    // Admin Notification
    prisma.notification.create({
      data: {
        role: 'admin',
        title: 'New Inquiry Received',
        message: `${parsed.data.name} just sent a new inquiry regarding "${parsed.data.subject}".`,
        type: 'alert'
      }
    }).catch(console.error)

    return NextResponse.json(
      { message: 'Your message has been sent! We will get back to you soon.', id: inquiry.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
