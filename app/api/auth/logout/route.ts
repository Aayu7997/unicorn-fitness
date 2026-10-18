import { cookies } from 'next/headers'
import { deleteSession } from '@/lib/session'
import { AUTH_COOKIE_NAME, deleteAuthCookie } from '@/lib/cookies'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })
    deleteAuthCookie(response)
    return response
  } catch (error) {
    console.error('Logout error:', error)
    const response = NextResponse.json({ message: 'Logged out' })
    deleteAuthCookie(response)
    return response
  }
}
