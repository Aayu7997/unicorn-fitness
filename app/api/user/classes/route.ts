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

    const classes = await prisma.classSchedule.findMany({
      where: { active: true },
      include: {
        bookings: {
          where: { userId: user.id }
        }
      },
      orderBy: { time: 'asc' }
    });

    // Format for frontend
    const formattedClasses = classes.map(c => ({
      id: c.id,
      name: c.name,
      time: c.time,
      trainer: c.trainer,
      booked: c.bookedCount,
      capacity: c.capacity,
      isBookedByMe: c.bookings.length > 0
    }));

    return NextResponse.json(formattedClasses);

  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
