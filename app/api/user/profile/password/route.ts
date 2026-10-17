import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function PUT(req: Request) {
  try {
    const sessionUser = await getSession()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()
    
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.passwordHash) return NextResponse.json({ error: "Google account has no password" }, { status: 400 });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 10)

    const updatedUser = await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
        passwordLastChangedAt: new Date()
      },
      select: { passwordLastChangedAt: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      passwordLastChangedAt: updatedUser.passwordLastChangedAt
    })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
