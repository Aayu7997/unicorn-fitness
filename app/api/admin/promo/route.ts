import { NextResponse } from 'next/server'
import { generateAdminContent } from '@/lib/ai-manager'
import { requireAdmin } from '@/lib/session'

export async function POST(req: Request) {
  try {
    const sessionAdmin = await requireAdmin()
    if (!sessionAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memberName, prompt } = await req.json()

    if (!memberName || !prompt) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const systemInstruction = `You are an elite Chief Marketing Officer (30+ years experience) and fitness industry veteran. 
Your task is to write a highly converting, personalized promotional message for a gym member named ${memberName}.
The message should be tailored for a local Indian/Jaipur audience (you may use a slight mix of professional English and polite Hindi warmth if appropriate, but keep it highly professional).
Keep the message concise, punchy, and irresistible. Do NOT include placeholders like [Your Name]. Sign off as "The UFC GYM Team".`;

    const aiMessage = await generateAdminContent(`Draft a promotional message for ${memberName}. The goal is: ${prompt}`, systemInstruction);

    // Because generateAdminContent can return an object or string due to tool support:
    const content = typeof aiMessage === 'string' ? aiMessage : aiMessage.text || JSON.stringify(aiMessage);

    return NextResponse.json({ message: content })
  } catch (error) {
    console.error('Promo AI Route Error:', error)
    return NextResponse.json({ error: 'Failed to generate promo message' }, { status: 500 })
  }
}
