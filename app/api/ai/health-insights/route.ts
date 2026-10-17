import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { generateAdvancedContent } from '@/lib/ai-manager'
export async function POST(req: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { age, height, weight, goals } = body

    const systemInstruction = `You are an elite fitness and nutrition expert AI for UFC GYM. Provide professional, highly personalized recommendations based on the user's details. Respond strictly in JSON format.`

    const prompt = `
A member has requested personalized health and fitness insights.
Their details:
- Age: ${age || 'Not specified'}
- Height: ${height || 'Not specified'} cm
- Weight: ${weight || 'Not specified'} kg
- Primary Goal: ${goals || 'General Fitness'}

Please calculate their estimated daily caloric needs (TDEE based on moderate exercise) and provide a professional, highly personalized recommendation.
Respond strictly in JSON format with no additional text or markdown formatting. The JSON must match this structure exactly:
{
  "summary": "A 2-3 sentence summary of their situation, goal, and daily caloric target.",
  "macros": {
    "protein": <number in grams>,
    "carbs": <number in grams>,
    "fats": <number in grams>
  },
  "recommendations": [
    "Actionable tip 1",
    "Actionable tip 2",
    "Actionable tip 3"
  ],
  "warning": "This is an AI-generated estimate and does not replace professional medical advice."
}
`

    const rawText = await generateAdvancedContent(prompt, systemInstruction, true);
    if (!rawText) throw new Error('No response from AI');

    let cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) cleanText = jsonMatch[1].trim();
    const insights = JSON.parse(cleanText);

    return NextResponse.json({
      success: true,
      insights
    })
  } catch (error) {
    console.error('AI Insights Error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
