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

    const messages = await prisma.supportMessage.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark unread messages as read
    const unreadMessages = messages.filter((m: any) => m.receiverId === user.id && !m.isRead);
    if (unreadMessages.length > 0) {
      await prisma.supportMessage.updateMany({
        where: {
          id: { in: unreadMessages.map((m: any) => m.id) }
        },
        data: { isRead: true }
      });
    }

    return NextResponse.json(messages);

  } catch (error) {
    console.error('Error fetching support messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    let message;
    try {
      const body = await req.json();
      message = body.message;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Find an admin to send to. In a real app, this might be a specific assigned trainer.
    // Here we'll just pick the first admin as the designated receiver.
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      return NextResponse.json({ error: 'No support staff available' }, { status: 400 });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        senderId: user.id,
        receiverId: admin.id,
        message: message.trim()
      },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    return NextResponse.json({ success: true, message: newMessage });

  } catch (error) {
    console.error('Error sending support message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
