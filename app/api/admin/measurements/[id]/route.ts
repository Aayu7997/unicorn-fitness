import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params;
    const data = await req.json()
    const { weight, bodyFat, muscleMass, goal, date } = data

    const measurement = await prisma.progressLog.update({
      where: { id },
      data: {
        weight: weight ? Number(weight) : undefined,
        bodyFat: bodyFat !== undefined ? (bodyFat ? Number(bodyFat) : null) : undefined,
        muscleMass: muscleMass !== undefined ? (muscleMass ? Number(muscleMass) : null) : undefined,
        goal,
        date: date ? new Date(date) : undefined
      }
    })
    return NextResponse.json(measurement)
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Measurement PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params;
    await prisma.progressLog.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Measurement DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
