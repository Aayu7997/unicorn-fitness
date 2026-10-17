import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export async function GET() {
  try {
    const sessionUser = await requireUser();
    if (!sessionUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessions = await prisma.advisorySession.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    });

    const formatted = sessions.map((s: any) => ({
      id: s.id,
      date: s.date ? s.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      topic: s.topic,
      advisor: s.advisor,
      status: s.status,
      createdAt: s.date
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('User Advisory GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await requireUser();
    if (!sessionUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { topic, advisor, date } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Consultation topic is required' }, { status: 400 });
    }

    const session = await prisma.advisorySession.create({
      data: {
        userId: user.id,
        topic: topic.trim(),
        advisor: advisor || 'Head Coach Carter',
        status: 'Upcoming',
        date: date ? new Date(date) : new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error('User Advisory POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
