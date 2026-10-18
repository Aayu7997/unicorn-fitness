import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_NAME } from '@/lib/cookies'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const planId = searchParams.get('planId')

  if (!planId) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 1. Authenticate User
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)

  if (!token) {
    // Intercept to login
    return NextResponse.redirect(new URL(`/signin?redirect=/api/enroll?planId=${planId}`, request.url))
  }

  // Find valid session
  const session = await prisma.session.findUnique({
    where: { token: token.value },
    include: { user: true }
  })

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect(new URL(`/signin?redirect=/api/enroll?planId=${planId}`, request.url))
  }

  const user = session.user

  // STRICT LOGICAL & SECURITY RULE:
  // Administrators are gym staff/management and cannot enroll in membership plans.
  // Admins must never be members, receive memberships, or be redirected to user dashboard.
  if (user.role === 'admin') {
    return NextResponse.redirect(new URL('/admin?error=AdminsCannotEnroll', request.url))
  }

  // 2. Fetch Plan
  let plan = await prisma.plan.findUnique({
    where: { id: planId }
  })

  if (!plan) {
    // Fallback: check if it's one of the static plans (e.g. from PricingSection)
    const { indianMembershipPlans } = await import('@/lib/indian-data')
    const staticPlan = indianMembershipPlans.find(p => p.id.toString() === planId)
    
    if (staticPlan) {
      plan = await prisma.plan.upsert({
        where: { id: planId },
        update: {},
        create: {
          id: planId,
          name: staticPlan.name,
          price: staticPlan.price,
          period: staticPlan.period,
          description: staticPlan.description,
          features: staticPlan.features,
          popular: staticPlan.popular
        }
      })
    } else {
      return NextResponse.redirect(new URL('/#pricing', request.url))
    }
  }

  // 3. Process True Enrollment Logic
  // End date is 1 month or 1 year from now based on period
  const startDate = new Date()
  const endDate = new Date()
  if (plan.period === 'year') {
    endDate.setFullYear(endDate.getFullYear() + 1)
  } else {
    endDate.setMonth(endDate.getMonth() + 1)
  }

  // Create Membership and Invoice in a Transaction
  await prisma.$transaction(async (tx) => {
    // Create the membership
    const membership = await tx.membership.create({
      data: {
        planId: plan.id,
        startDate,
        endDate,
        status: 'active',
      }
    })

    // Update the user
    await tx.user.update({
      where: { id: user.id },
      data: { membershipId: membership.id }
    })

    // Create an Invoice
    await tx.invoice.create({
      data: {
        userId: user.id,
        amount: plan.price,
        status: 'Paid',
        planName: plan.name,
      }
    })
  })

  // Notifications
  prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Welcome to ' + plan.name + '!',
      message: 'Your subscription is now active. You can start booking classes.',
      type: 'success'
    }
  }).catch(console.error);

  prisma.notification.create({
    data: {
      role: 'admin',
      title: 'New Plan Enrollment',
      message: `${user.name} (${user.email}) just subscribed to ${plan.name}.`,
      type: 'info'
    }
  }).catch(console.error);

  // 4. Redirect to Dashboard
  return NextResponse.redirect(new URL('/dashboard?enrolled=success', request.url))
}
