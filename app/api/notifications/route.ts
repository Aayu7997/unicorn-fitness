import { NextResponse } from 'next/server';
import { getSession, requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Fetch notifications for the logged-in user
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { role: user.role }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new notification (Admin only)
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { title, message, type, target, targetUserId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (target === 'all_users') {
      const users = await prisma.user.findMany({
        where: { role: 'user' },
        select: { id: true }
      });
      
      const notifications = users.map((u: { id: string }) => ({
        userId: u.id,
        title,
        message,
        type: type || 'info'
      }));

      await prisma.notification.createMany({
        data: notifications
      });
      return NextResponse.json({ success: true, count: users.length });
    } else if (target === 'specific_user' && targetUserId) {
      const notification = await prisma.notification.create({
        data: {
          userId: targetUserId,
          title,
          message,
          type: type || 'info'
        }
      });
      return NextResponse.json({ success: true, notification });
    } else if (target === 'all_admins') {
      const notification = await prisma.notification.create({
        data: {
          role: 'admin',
          title,
          message,
          type: type || 'system'
        }
      });
      return NextResponse.json({ success: true, notification });
    }

    return NextResponse.json({ error: 'Invalid target specified' }, { status: 400 });

  } catch (error: any) {
    console.error('Error creating notification:', error);
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Mark notifications as read
export async function PATCH(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationIds } = body; // Array of IDs to mark read

    if (!notificationIds || !Array.isArray(notificationIds)) {
      // Mark all as read
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: user.id },
            { role: user.role }
          ],
          isRead: false
        },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          OR: [
            { userId: user.id },
            { role: user.role }
          ]
        },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
