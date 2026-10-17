import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const plans = await db.getMembershipPlans()
    return NextResponse.json(plans)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch membership plans' },
      { status: 500 }
    )
  }
}
