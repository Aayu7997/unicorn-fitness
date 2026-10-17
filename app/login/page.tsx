import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Deprecated: Redirect to the new Apple-tier signin page
  redirect('/signin')
}
