import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

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

    const { classId } = await req.json();

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // Use a transaction to prevent overbooking
    const result = await prisma.$transaction(async (tx) => {
      const classSchedule = await tx.classSchedule.findUnique({
        where: { id: classId }
      });

      if (!classSchedule) {
        throw new Error('Class not found');
      }

      if (classSchedule.bookedCount >= classSchedule.capacity) {
        throw new Error('Class is full');
      }

      const existingBooking = await tx.classBooking.findUnique({
        where: {
          userId_classScheduleId: {
            userId: user.id,
            classScheduleId: classId
          }
        }
      });

      if (existingBooking) {
        throw new Error('Already booked');
      }

      // Create booking
      await tx.classBooking.create({
        data: {
          userId: user.id,
          classScheduleId: classId
        }
      });

      // Increment booked count
      const updatedClass = await tx.classSchedule.update({
        where: { id: classId },
        data: {
          bookedCount: {
            increment: 1
          }
        }
      });

      return updatedClass;
    });

    return NextResponse.json({ success: true, class: result });

  } catch (error: any) {
    console.error('Error booking class:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
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

    const { classId } = await req.json();

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.classBooking.findUnique({
        where: {
          userId_classScheduleId: {
            userId: user.id,
            classScheduleId: classId
          }
        }
      });

      if (!existingBooking) {
        throw new Error('No active booking found for this class');
      }

      await tx.classBooking.delete({
        where: {
          userId_classScheduleId: {
            userId: user.id,
            classScheduleId: classId
          }
        }
      });

      const updatedClass = await tx.classSchedule.update({
        where: { id: classId },
        data: {
          bookedCount: {
            decrement: 1
          }
        }
      });

      return updatedClass;
    });

    return NextResponse.json({ success: true, class: result });

  } catch (error: any) {
    console.error('Error cancelling class booking:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}

