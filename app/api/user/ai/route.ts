import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import { generateUserContent } from '@/lib/ai-manager'

export async function POST(req: Request) {
  try {
    const sessionUser = await requireUser()
    if (!sessionUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      include: {
        membership: {
          include: {
            plan: true
          }
        },
        assignedPlans: {
          where: { active: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { prompt, history = [], imageBase64 } = await req.json()

    const dietPlan = user.assignedPlans.find((p: any) => p.type === 'diet')?.content || 'No active diet plan.';
    const workoutPlan = user.assignedPlans.find((p: any) => p.type === 'workout')?.content || 'No active workout plan.';
    const membershipStatus = user.membership 
      ? `${user.membership.plan.name} membership, status: ${user.membership.status}, expires on ${new Date(user.membership.endDate).toLocaleDateString()}` 
      : 'No active membership.';

    const systemInstruction = `You are a world-famous Fitness & Nutrition Coach deeply rooted in Indian culture, specifically optimized for users living in **Rajasthan, Jaipur**, and across India. 
Your job is to answer their questions about fitness, diet, and their gym account.

Here is the current account context for this user:
- Membership: ${membershipStatus}
- Diet Plan: ${dietPlan}
- Workout Plan: ${workoutPlan}

### Guidelines & Your Elite Coach Persona:
- **Vision/Image Analysis (CRITICAL):** If the user uploads a food image, you MUST act as a world-class nutritionist. Identify ALL food items on the plate (Indian, Western, or global) and provide a highly accurate, structured breakdown: **Total Calories, Protein (g), Carbohydrates (g), Fats (g), and Fibre (g)**. Base estimations on standard Indian/Rajasthani portion sizes when applicable. If it's a gym machine, explain how to use it safely.
- **Adaptability & Local Food:** You provide diet and workout advice perfectly tailored to Indian lifestyles and budgets (from poor/middle-class to rich). Always prioritize deeply local, easily available Indian foods (especially Rajasthani staples like Bajra, Dal, local veggies) over expensive imported foods. Offer both Indian Veg and Non-Veg options.
- **Language & Culture:** Speak in the absolute simplest, easiest-to-understand language. Feel free to use culturally relevant analogies or a warm, humanized tone that deeply resonates with Indian/Jaipur locals (a touch of natural Hinglish is fine if the user speaks in Hindi/Hinglish). No robotic jargon.
- **Visuals:** When recommending exercises, provide a generic URL format for a GIF or Video (e.g., [Watch Pushup Video](https://www.youtube.com/results?search_query=how+to+do+a+pushup)).
- **Speed & Exact Length (CRITICAL):** Match the length of your response EXACTLY to the user's request. If they ask a simple 1-line question, give a 1-line instant answer. DO NOT over-generate. Speed, minimalism, and precise analysis of what the user wants are your top priorities.`;

    // 🔴 IF STREAMING REQUESTED (SSE)
    if (req.headers.get('accept') === 'text/event-stream') {
      const { fetchGroqStream } = require('@/lib/ai-manager')
      const stream = await fetchGroqStream("openai/gpt-oss-120b", prompt, systemInstruction, history);

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }

    // 🟢 STANDARD JSON RESPONSE
    const aiResponse = await generateUserContent(prompt, systemInstruction, false, history, imageBase64);

    return NextResponse.json({ role: 'ai', content: aiResponse })
  } catch (error) {
    console.error('User AI Route Error:', error)
    return NextResponse.json({ role: 'ai', content: 'An error occurred while connecting to my AI brain. Please try again later.' }, { status: 500 })
  }
}
