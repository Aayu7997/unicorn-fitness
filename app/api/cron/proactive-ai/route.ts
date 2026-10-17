import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUserContent } from '@/lib/ai-manager'

// This route should be triggered by a Cron Job (e.g. Vercel Cron) daily
// GET /api/cron/proactive-ai
export async function GET(req: Request) {
  try {
    // 1. Fetch all active users (limit 50 for safety in serverless)
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      take: 50,
      include: {
        assignedPlans: { where: { active: true } },
      }
    })

    let notificationsCreated = 0;

    // 2. Loop through users and generate a highly personalized daily message
    for (const user of users) {
      const dietPlan = user.assignedPlans.find((p: any) => p.type === 'diet')?.content || 'no specific diet';
      const workoutPlan = user.assignedPlans.find((p: any) => p.type === 'workout')?.content || 'no specific workout';

      const prompt = `You are a proactive, elite AI fitness coach checking in on your client ${user.name}. 
Their current diet focus: ${dietPlan}. 
Their workout focus: ${workoutPlan}.

Write exactly 1 short, highly motivating, human-like push notification message (max 2 sentences) for them today. Speak like a real Indian coach checking in. Be slightly demanding but encouraging.`;

      // Use the lightning fast Groq model
      const aiMessage = await generateUserContent(prompt, "", false, []);

      // 3. Save as a Notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Message from AI Coach 🥊',
          message: aiMessage.replace(/["*]/g, ''), // Clean markdown/quotes
          type: 'proactive_ai',
        }
      });
      
      notificationsCreated++;
    }

    return NextResponse.json({ success: true, message: `Successfully generated ${notificationsCreated} proactive AI messages.` })
  } catch (error) {
    console.error('Proactive AI Cron Error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
