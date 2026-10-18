import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import prisma from '@/lib/prisma'
import { Resend } from 'resend'
export const dynamic = 'force-dynamic';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    let body;
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const { message, type } = body

    if (!message || typeof message !== 'string' || !type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Valid message and type are required' }, { status: 400 })
    }

    if (message.length > 5000 || type.length > 100) {
      return NextResponse.json({ error: 'Payload exceeds allowed length limits' }, { status: 400 })
    }

    const resolvedParams = await params;
    const memberId = resolvedParams.id;
    
    // Fetch member details (strictly regular members)
    const member = await prisma.user.findFirst({
      where: { id: memberId, role: 'user' }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // 1. Create In-App Notification
    await prisma.notification.create({
      data: {
        userId: memberId,
        title: type === 'Renewal Reminder' ? 'Membership Renewal Reminder' : 'Special Offer for You!',
        message: message.trim(),
        type: type === 'Renewal Reminder' ? 'alert' : 'promo'
      }
    })

    // 2. Send Real Email via Resend with HTML Escaping (OWASP LLM05 / A03 Injection defense)
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
              <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>
          </div>
        `
      })
    }

    revalidatePath('/', 'layout'); return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('AI Promo Send Error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
