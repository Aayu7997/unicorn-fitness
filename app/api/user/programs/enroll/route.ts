import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_NAME } from '@/lib/cookies'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const programId = searchParams.get('programId')

  if (!programId) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 1. Authenticate User
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)

  if (!token) {
    // Intercept to login
    return NextResponse.redirect(new URL(`/signin?redirect=/api/user/programs/enroll?programId=${programId}`, request.url))
  }

  // Find valid session
  const session = await prisma.session.findUnique({
    where: { token: token.value },
    include: { user: true }
  })

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect(new URL(`/signin?redirect=/api/user/programs/enroll?programId=${programId}`, request.url))
  }

  const user = session.user
  if (user.role === 'admin') {
    return NextResponse.redirect(new URL('/admin?error=AdminsCannotEnrollPrograms', request.url))
  }

  // 2. Fetch Program
  const program = await prisma.program.findUnique({
    where: { id: programId }
  })

  if (!program) {
    return NextResponse.redirect(new URL('/programs', request.url))
  }

  // 3. Process Enrollment (Connect Program to User)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      programs: {
        connect: { id: program.id }
      }
    }
  })

  // 4. Redirect to Dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}

export async function POST(request: Request) {
  try {
    const session = await (await import('@/lib/session')).getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot enroll in user programs' }, { status: 403 })
    }

    const { programId } = await request.json()
    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 })
    }

    const program = await prisma.program.findUnique({
      where: { id: programId }
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: session.id },
      data: {
        programs: {
          connect: { id: program.id }
        }
      }
    })

    return NextResponse.json({ success: true, message: 'Enrolled successfully', program })
  } catch (error) {
    console.error('Program enroll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
