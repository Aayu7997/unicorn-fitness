import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/session';
import { getPeriodDateRange } from '@/lib/admin-period';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6m';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const { startDate: periodStart, endDate: periodEnd, label: periodLabel } = getPeriodDateRange(
      period,
      { from: fromParam, to: toParam }
    );

    // 1. Memberships (strictly filter to user role)
    const activeMembers = await prisma.membership.count({
      where: { status: 'active', endDate: { gte: now }, users: { some: { role: 'user' } } }
    });
    const activeExpiring = await prisma.membership.count({
      where: { status: 'active', endDate: { gt: now, lte: fifteenDaysFromNow }, users: { some: { role: 'user' } } }
    });
    const totalExpired = await prisma.membership.count({
      where: { users: { some: { role: 'user' } }, OR: [{ status: 'expired' }, { endDate: { lt: now } }] }
    });

    // 2. Today's Operations
    const todayRegistration = await prisma.user.count({
      where: { role: 'user', createdAt: { gte: todayStart, lt: todayEnd } }
    });
    const todayFollowup = await prisma.contactInquiry.count({
      where: { status: 'replied', updatedAt: { gte: todayStart, lt: todayEnd } }
    });
    const todayExpiring = await prisma.membership.count({
      where: { status: 'active', endDate: { gte: todayStart, lt: todayEnd }, users: { some: { role: 'user' } } }
    });
    const todayExpired = await prisma.membership.count({
      where: { endDate: { gte: todayStart, lt: todayEnd }, status: 'expired', users: { some: { role: 'user' } } }
    });

    // 3. Month's Operations
    const monthRegistration = await prisma.user.count({
      where: { role: 'user', createdAt: { gte: monthStart, lt: monthEnd } }
    });
    const monthFollowup = await prisma.contactInquiry.count({
      where: { status: 'replied', updatedAt: { gte: monthStart, lt: monthEnd } }
    });
    const monthExpiring = await prisma.membership.count({
      where: { status: 'active', endDate: { gte: monthStart, lt: monthEnd }, users: { some: { role: 'user' } } }
    });
    const monthExpired = await prisma.membership.count({
      where: { endDate: { gte: monthStart, lt: monthEnd }, status: 'expired', users: { some: { role: 'user' } } }
    });

    // 4. Selected Period Operations
    const periodRegistration = await prisma.user.count({
      where: { role: 'user', createdAt: { gte: periodStart, lte: periodEnd } }
    });
    const periodFollowup = await prisma.contactInquiry.count({
      where: { status: 'replied', updatedAt: { gte: periodStart, lte: periodEnd } }
    });
    const periodExpiring = await prisma.membership.count({
      where: { status: 'active', endDate: { gte: periodStart, lte: periodEnd }, users: { some: { role: 'user' } } }
    });
    const periodExpired = await prisma.membership.count({
      where: { endDate: { gte: periodStart, lte: periodEnd }, status: 'expired', users: { some: { role: 'user' } } }
    });

    // 5. Enquiries
    const totalEnquiry = await prisma.contactInquiry.count();
    const newEnquiry = await prisma.contactInquiry.count({ where: { status: 'new' } });
    const convertedEnquiry = await prisma.contactInquiry.count({ where: { status: 'closed' } });
    const followupEnquiry = await prisma.contactInquiry.count({ where: { status: 'replied' } });

    // 5. Financials
    const activeMemberships = await prisma.membership.findMany({
      where: { status: 'active', users: { some: { role: 'user' } } },
      include: { plan: true }
    });
    const expectedCollection = activeMemberships.reduce((sum, m) => sum + (m.plan?.price || 0), 0);
    
    const invoicesTotal = await prisma.invoice.aggregate({
      where: { user: { role: 'user' } },
      _sum: { amount: true }
    });
    const totalCollection = invoicesTotal._sum.amount || 0;

    const invoicesActive = await prisma.invoice.aggregate({
      where: { date: { gte: monthStart, lt: monthEnd }, user: { role: 'user' } },
      _sum: { amount: true }
    });
    const activeCollection = invoicesActive._sum.amount || 0;

    const invoicesPeriod = await prisma.invoice.aggregate({
      where: { date: { gte: periodStart, lte: periodEnd }, user: { role: 'user' } },
      _sum: { amount: true }
    });
    const periodCollection = invoicesPeriod._sum.amount || 0;

    const expensesPeriod = await prisma.expense.aggregate({
      where: { date: { gte: periodStart, lte: periodEnd } },
      _sum: { amount: true }
    });
    const periodExpenses = expensesPeriod._sum.amount || 0;

    // Derived Financials
    const expiredCollection = Math.max(0, expectedCollection - activeCollection);
    const balanceCollection = Math.max(0, expectedCollection - totalCollection);

    return NextResponse.json({
      memberships: {
        activeMembers,
        activeExpiring,
        totalExpired,
      },
      today: {
        registration: todayRegistration,
        followup: todayFollowup,
        expiring: todayExpiring,
        expired: todayExpired,
      },
      month: {
        registration: monthRegistration,
        followup: monthFollowup,
        expiring: monthExpiring,
        expired: monthExpired,
      },
      periodStats: {
        period,
        label: periodLabel,
        startDate: periodStart.toISOString(),
        endDate: periodEnd.toISOString(),
        registration: periodRegistration,
        followup: periodFollowup,
        expiring: periodExpiring,
        expired: periodExpired,
        collection: periodCollection,
        expenses: periodExpenses,
        netProfit: periodCollection - periodExpenses,
      },
      enquiries: {
        total: totalEnquiry,
        new: newEnquiry,
        converted: convertedEnquiry,
        followup: followupEnquiry,
      },
      financials: {
        expectedCollection,
        totalCollection,
        activeCollection,
        expiredCollection,
        balanceCollection,
        periodCollection,
      }
    });
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
