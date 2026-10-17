import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email : ''
  const token = typeof params.token === 'string' ? params.token : ''

  const query = new URLSearchParams()
  if (email) query.set('email', email)
  if (token) query.set('token', token)

  const queryString = query.toString()
  redirect(`/forgot-password${queryString ? `?${queryString}` : ''}`)
}
