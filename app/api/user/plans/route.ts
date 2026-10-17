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

    const plans = await prisma.assignedPlan.findMany({
      where: {
        userId: user.id,
        active: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by type for easier frontend consumption
    const workoutPlan = plans.find((p: any) => p.type === 'workout');
    const dietPlan = plans.find((p: any) => p.type === 'diet');

    return NextResponse.json({
      workout: workoutPlan ? workoutPlan.content : null,
      diet: dietPlan ? dietPlan.content : null
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
