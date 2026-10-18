import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import prisma from '@/lib/prisma'
import { generateAdvancedContent } from '@/lib/ai-manager'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const body = await req.json()
    const { type } = body // e.g., 'Renewal Reminder' or 'Special Offer'

    const resolvedParams = await params;
    const memberId = resolvedParams.id;
    
    // Fetch member details (strictly regular members)
    const member = await prisma.user.findFirst({
      where: { id: memberId, role: 'user' },
      include: {
        membership: {
          include: { plan: true }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const systemInstruction = 'You are an expert gym marketing and customer relations manager at UFC GYM.'
    const prompt = `
You need to write a highly personalized ${type} message to be sent to a gym member.
Keep the tone professional, motivating, and polite. 
It should be short, punchy, and sound like it was written by a human manager, not an AI.

Member Details:
- Name: ${member.name || 'Valued Member'}
- Current Membership Status: ${member.membership ? member.membership.status : 'No active membership'}
${member.membership ? '- Current Plan: ' + member.membership.plan.name : ''}
${member.membership ? '- Expiry Date: ' + new Date(member.membership.endDate).toLocaleDateString() : ''}

Important:
- Only output the raw message text. 
- Do NOT wrap the message in quotes.
- Do NOT add any preamble or concluding remarks. Just the message itself.
- End the message with "Best regards, The UFC GYM Team"
`

    const text = await generateAdvancedContent(prompt, systemInstruction, false);
    if (!text) throw new Error('No response from AI');

    revalidatePath('/', 'layout'); return NextResponse.json({
      success: true,
      message: text.trim()
    })
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('AI Promo Generation Error:', error)
    return NextResponse.json({ error: 'Failed to generate promotional message' }, { status: 500 })
  }
}
