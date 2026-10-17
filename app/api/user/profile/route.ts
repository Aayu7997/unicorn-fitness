import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, phone, age, height, gender, weight, avatarBase64 } = await request.json();

    let finalAvatarUrl = avatarBase64;
    if (avatarBase64 && typeof avatarBase64 === 'string' && avatarBase64.startsWith('data:image/')) {
      try {
        const uploadRes = await uploadToCloudinary(avatarBase64, 'users/avatars');
        if (uploadRes?.url) {
          finalAvatarUrl = uploadRes.url;
        }
      } catch (uploadErr) {
        console.error('Cloudinary avatar upload fallback:', uploadErr);
      }
    }

    const user = await prisma.user.update({
      where: { id: session.id as string },
      data: {
        name: name || undefined,
        phone: phone || null,
        age: age ? parseInt(age) : null,
        height: height ? parseFloat(height) : null,
        gender: gender || null,
        ...(finalAvatarUrl !== undefined && { avatarUrl: finalAvatarUrl || null }),
      }
    });

    if (weight) {
      await prisma.progressLog.create({
        data: {
          userId: user.id,
          weight: parseFloat(weight),
          date: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.id as string },
      include: {
        progressLogs: {
          orderBy: { date: 'desc' },
          take: 1
        },
        notifications: {
          where: { type: 'proactive_ai' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return NextResponse.json({ user });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}