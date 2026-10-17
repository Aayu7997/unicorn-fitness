import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function GET(request: Request) {
  try {
    const adminUser = await requireAdmin()
    const user = await prisma.user.findUnique({
      where: { id: adminUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        avatarPublicId: true,
        phone: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to fetch profile' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAdmin()

    const data = await request.json()
    const { avatarUrl, avatarPublicId, name, phone } = data

    let finalAvatarUrl = avatarUrl

    // If avatarUrl is base64 data, upload to Cloudinary directly
    if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('data:image/')) {
      try {
        const uploadRes = await uploadToCloudinary(avatarUrl, 'users/avatars')
        if (uploadRes?.url) {
          finalAvatarUrl = uploadRes.url
        }
      } catch (uploadErr) {
        console.error('Cloudinary admin avatar upload fallback:', uploadErr)
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(avatarUrl !== undefined && { avatarUrl: finalAvatarUrl || null }),
        ...(avatarPublicId !== undefined && { avatarPublicId: avatarPublicId || null }),
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        avatarPublicId: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      avatarUrl: updatedUser.avatarUrl,
      user: updatedUser,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
