// Mock database layer - replace with actual DB in production
import type { User, Program, MembershipPlan, Testimonial } from './types'

// In-memory store (replace with real database)
let users: Map<string, User> = new Map()
let programs: Map<string, Program> = new Map()
let membershipPlans: Map<string, MembershipPlan> = new Map()
let testimonials: Map<string, Testimonial> = new Map()

// Initialize with sample data
function initializeData() {
  // Programs
  programs.set('1', {
    id: '1',
    name: 'Strength Training',
    description: 'Build muscle and increase power with our comprehensive strength program.',
    image: '/images/program-strength.jpg',
    trainer: '- Johnson',
    duration: '12 weeks',
    level: 'Intermediate',
  })
  programs.set('2', {
    id: '2',
    name: 'Cardio Elite',
    description: 'High-intensity cardiovascular training for maximum endurance.',
    image: '/images/program-cardio.jpg',
    trainer: 'Sarah Williams',
    duration: '8 weeks',
    level: 'Advanced',
  })
  programs.set('3', {
    id: '3',
    name: 'Yoga & Flexibility',
    description: 'Transform your body with mindful movement and flexibility training.',
    image: '/images/program-yoga.jpg',
    trainer: 'Emma Davis',
    duration: '6 weeks',
    level: 'Beginner',
  })

  // Membership Plans
  membershipPlans.set('1', {
    id: '1',
    name: 'Starter',
    price: 29,
    billingCycle: 'monthly',
    features: ['- to gym', 'Standard equipment', 'Mobile app'],
    highlighted: false,
  })
  membershipPlans.set('2', {
    id: '2',
    name: 'Pro',
    price: 59,
    billingCycle: 'monthly',
    features: ['- Starter features', 'Group classes', 'Personal trainer consultation', 'Premium equipment'],
    highlighted: true,
  })
  membershipPlans.set('3', {
    id: '3',
    name: 'Elite',
    price: 99,
    billingCycle: 'monthly',
    features: ['- Pro features', 'Dedicated trainer', 'Nutrition planning', 'Priority support', 'VIP lounge access'],
    highlighted: false,
  })

  // Testimonials
  testimonials.set('1', {
    id: '1',
    name: 'Marcus Thompson',
    role: 'CEO, Tech Startup',
    content: 'This gym transformed not just my body, but my entire life. The trainers are world-class.',
    image: '/images/testimonial-1.jpg',
    rating: 5,
  })
  testimonials.set('2', {
    id: '2',
    name: 'Jessica Rodriguez',
    role: 'Fitness Enthusiast',
    content: 'The facilities are incredible and the community is supportive. Worth every penny.',
    image: '/images/testimonial-2.jpg',
    rating: 5,
  })
  testimonials.set('3', {
    id: '3',
    name: 'David Chen',
    role: 'Marathon Runner',
    content: 'Best place to train. The variety of programs keeps me motivated and challenged.',
    image: '/images/testimonial-3.jpg',
    rating: 5,
  })
}

initializeData()

export const db = {
  // User operations
  async getUser(email: string): Promise<User | null> {
    return users.get(email) || null
  },

  async createUser(user: User): Promise<User> {
    users.set(user.email, user)
    return user
  },

  async updateUser(email: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(email)
    if (!user) return null
    const updated = { ...user, ...updates }
    users.set(email, updated)
    return updated
  },

  // Program operations
  async getPrograms(): Promise<Program[]> {
    return Array.from(programs.values())
  },

  async getProgram(id: string): Promise<Program | null> {
    return programs.get(id) || null
  },

  // Membership operations
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    return Array.from(membershipPlans.values())
  },

  async getMembershipPlan(id: string): Promise<MembershipPlan | null> {
    return membershipPlans.get(id) || null
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(testimonials.values())
  },
}
