import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await requireUser();
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        membership: {
          include: { plan: true }
        },
        progressLogs: {
          orderBy: { date: 'desc' },
          take: 1
        },
        classBookings: {
          include: { classSchedule: true },
          where: {
            classSchedule: {
              active: true
            }
          }
        }
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine next class
    const nextClass = userData.classBookings.length > 0 
      ? userData.classBookings[0].classSchedule.name 
      : 'None booked';

    // Determine weight
    const currentWeight = userData.progressLogs.length > 0
      ? `${userData.progressLogs[0].weight} kg`
      : 'Not recorded';

    // Determine active plan
    const activePlan = userData.membership?.status === 'active' 
      ? userData.membership.plan.name 
      : 'No Active Plan';

    return NextResponse.json({
      name: userData.name,
      activePlan,
      nextClass,
      currentWeight
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
