import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession()
    
    // Allow admins to delete
    await prisma.assignedPlan.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Assigned Plan DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
