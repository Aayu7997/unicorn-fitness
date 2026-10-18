import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { generateUserContent, sanitizePrompt, SYSTEM_GUARDRAILS } from '@/lib/ai-manager'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSession } from '@/lib/session'

// This route should be triggered securely by a Cron Job (e.g. Vercel Cron) daily
// GET /api/cron/proactive-ai
export async function GET(req: Request) {
  try {
    const ip = getClientIp(req.headers)
    
    // 1. Rate-limit cron trigger attempts (OWASP API4 / LLM10)
    const rateCheck = checkRateLimit(`cron-proactive-ai:${ip}`, { windowMs: 60 * 1000, max: 5 })
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many cron trigger attempts' }, { status: 429 })
    }

    // 2. Authenticate cron trigger (OWASP API2 / Broken Function Level Authorization)
    const cronSecret = process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization') || ''
    const isVercelCron = Boolean(req.headers.get('x-vercel-cron'))

    if (cronSecret) {
      const expectedHeader = `Bearer ${cronSecret}`
      const matches = 
        authHeader.length === expectedHeader.length &&
        crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedHeader))
      
      if (!matches) {
        console.warn(`Unauthorized cron attempt from IP: ${ip}`)
        return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('CRON_SECRET environment variable is not configured in production.')
      return NextResponse.json({ error: 'Cron service unconfigured' }, { status: 503 })
    } else {
      // In local dev, allow localhost or an authenticated admin session
      const session = await getSession().catch(() => null)
      const isAdmin = session?.role === 'admin'
      const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost'
      if (!isAdmin && !isLocal && !isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // 3. Fetch all active users (limit 50 for safety in serverless)
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      take: 50,
      include: {
        assignedPlans: { where: { active: true } },
      }
    })

    let notificationsCreated = 0;

    // 4. Loop through users and generate a personalized daily message
    for (const user of users) {
      const dietPlan = user.assignedPlans.find((p: any) => p.type === 'diet')?.content || 'no specific diet';
      const workoutPlan = user.assignedPlans.find((p: any) => p.type === 'workout')?.content || 'no specific workout';
      const cleanName = sanitizePrompt(user.name || 'Member', 50);

      const prompt = `You are a proactive, elite AI fitness coach checking in on your client ${cleanName}.
<user_context>
- Diet focus: ${sanitizePrompt(dietPlan, 300)}
- Workout focus: ${sanitizePrompt(workoutPlan, 300)}
</user_context>

Write exactly 1 short, motivating, human-like push notification message (max 2 sentences) for them today. Speak like a real Indian coach checking in. Be slightly demanding but encouraging.`;

      const aiMessage = await generateUserContent(prompt, SYSTEM_GUARDRAILS, false, []);

      // 5. Save as a Notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Message from AI Coach 🥊',
          message: aiMessage.replace(/["*]/g, '').trim(), // Clean markdown/quotes
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
