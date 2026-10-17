import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { generateAdvancedContent } from '@/lib/ai-manager';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let text;
    try {
      const body = await request.json();
      text = body.text;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

    const systemInstruction = 'You are a translation assistant.';
    const prompt = `Translate the following fitness/exercise instructions into clear, simple Hindi. Ensure it is easy to understand for a gym-goer. Return ONLY the translated text, with no extra conversation or markdown:
    
${text}`;

    const textResponse = await generateAdvancedContent(prompt, systemInstruction, false);

    const translatedText = textResponse.trim();

    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}