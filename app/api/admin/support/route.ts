import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  try {
    const sessionUser = await requireAdmin();
    if (!sessionUser?.email || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all support messages
    const messages = await prisma.supportMessage.findMany({
      include: {
        sender: { select: { id: true, name: true, role: true, email: true } },
        receiver: { select: { id: true, name: true, role: true, email: true } }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error('Error fetching admin support messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await requireAdmin();
    if (!sessionUser?.email || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: sessionUser.email }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const { message, receiverId } = await req.json();

    if (!message || message.trim() === '' || !receiverId) {
      return NextResponse.json({ error: 'Message and receiverId are required' }, { status: 400 });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        senderId: admin.id,
        receiverId,
        message: message.trim()
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } }
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
