export interface User {
  id: string
  email: string
  password?: string // hashed
  role: 'admin' | 'user'
  name: string
  createdAt: Date
}

export interface Program {
  id: string
  name: string
  description: string
  image: string
  trainer: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}

export interface MembershipPlan {
  id: string
  name: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  highlighted: boolean
}

export interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  image?: string
  imageUrl?: string
  transformation?: string
  rating: number
}

export interface Session {
  userId: string
  email: string
  role: 'admin' | 'user'
  name: string
}
