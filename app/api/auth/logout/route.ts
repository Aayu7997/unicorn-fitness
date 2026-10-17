import { cookies } from 'next/headers'
import { deleteSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_session')?.value

    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.delete('auth_session')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    const response = NextResponse.json({ message: 'Logged out' })
    response.cookies.delete('auth_session')
    return response
  }
}
