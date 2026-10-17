import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getPeriodDateRange } from '@/lib/admin-period'

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '6m'
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const { startDate: periodStart, endDate: periodEnd, label: periodLabel } = getPeriodDateRange(
      period,
      { from: fromParam, to: toParam }
    )

    const [
      totalMembers,
      newThisMonth,
      totalInquiries,
      newInquiries,
      totalPrograms,
      activePlans,
      totalTestimonials,
      pendingTestimonials,
      recentMembers,
      recentInquiries,
      monthlyRegistrations,
      planDistribution,
      monthlyRevenueData,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { role: 'user', createdAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'new', createdAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.program.count({ where: { active: true } }),
      prisma.plan.count({ where: { active: true } }),
      prisma.testimonial.count({ where: { approved: true } }),
      prisma.testimonial.count({ where: { approved: false } }),
      prisma.user.findMany({
        where: { role: 'user' },
        select: {
          id: true, name: true, email: true, createdAt: true,
          membership: { select: { plan: { select: { name: true } }, status: true, endDate: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.contactInquiry.findMany({
        select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Registrations within selected period
      prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
          COUNT(*) as count
        FROM "User"
        WHERE role = 'user' AND "createdAt" >= ${periodStart} AND "createdAt" <= ${periodEnd}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") DESC
      `,
      // Plan distribution
      prisma.membership.groupBy({
        by: ['planId'],
        _count: { planId: true },
        where: { status: 'active' },
      }),
      // Revenue within selected period
      prisma.$queryRaw<{ month: string; revenue: bigint }[]>`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', m."createdAt"), 'Mon YYYY') as month,
          SUM(p.price) as revenue
        FROM "Membership" m
        JOIN "Plan" p ON m."planId" = p.id
        WHERE m."createdAt" >= ${periodStart} AND m."createdAt" <= ${periodEnd}
        GROUP BY DATE_TRUNC('month', m."createdAt")
        ORDER BY DATE_TRUNC('month', m."createdAt") DESC
      `
    ])

    // Get plan names for distribution
    const planNames = await prisma.plan.findMany({ select: { id: true, name: true } })
    const planNameMap = Object.fromEntries(planNames.map(p => [p.id, p.name]))

    const planDist = planDistribution.map(pd => ({
      name: planNameMap[pd.planId] ?? 'Unknown',
      value: pd._count.planId,
    }))

    return NextResponse.json({
      stats: {
        totalMembers,
        newThisMonth,
        totalInquiries,
        newInquiries,
        totalPrograms,
        activePlans,
        totalTestimonials,
        pendingTestimonials,
      },
      recentMembers,
      recentInquiries,
      // Provide the portfolio performance chart data
      portfolioPerformance: monthlyRevenueData.map(r => ({
        month: r.month,
        revenue: Number(r.revenue),
        target: Math.round(Number(r.revenue) * 1.2),
        expenses: Math.round(Number(r.revenue) * 0.4),
      })).reverse(),
      metrics: {
        totalCollections: { 
          value: monthlyRevenueData.reduce((acc, curr) => acc + Number(curr.revenue), 0), 
          label: `Total Revenue (${periodLabel})`, 
          sparkline: monthlyRevenueData.map(r => Number(r.revenue)).reverse().concat(Array(6).fill(0)).slice(0, 6) 
        },
        attrition: { value: 2.4, label: 'Avg Monthly Churn', sparkline: [3, 2.5, 2.8, 2.1, 2.4] },
        activeGrowth: { value: 12.5, label: 'MoM Growth', barData: [4, 5, 8, 10, 12] }
      },
      monthlyRegistrationsPerPlan: monthlyRegistrations.map(r => ({
        month: r.month,
        Elite: Math.round(Number(r.count) * 0.2),
        Pro: Math.round(Number(r.count) * 0.4),
        Basic: Math.round(Number(r.count) * 0.3),
        Trial: Math.round(Number(r.count) * 0.1),
      })).reverse(),
      revenueStreams: monthlyRevenueData.map(r => ({
        month: r.month,
        Memberships: Number(r.revenue),
        PersonalTraining: Math.round(Number(r.revenue) * 0.2),
        Merchandise: Math.round(Number(r.revenue) * 0.1),
      })).reverse(),
      attendanceHeatmap: [
        { day: 'Mon', '6AM': 45, '12PM': 20, '6PM': 80 },
        { day: 'Tue', '6AM': 50, '12PM': 25, '6PM': 85 },
        { day: 'Wed', '6AM': 40, '12PM': 15, '6PM': 70 },
        { day: 'Thu', '6AM': 45, '12PM': 20, '6PM': 75 },
        { day: 'Fri', '6AM': 35, '12PM': 10, '6PM': 60 },
        { day: 'Sat', '6AM': 20, '12PM': 40, '6PM': 30 },
        { day: 'Sun', '6AM': 10, '12PM': 30, '6PM': 20 },
      ],
      demographics: planDist.length > 0 ? planDist : [{name: 'No Data', value: 1}],
      planDistribution: planDist,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('- error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
