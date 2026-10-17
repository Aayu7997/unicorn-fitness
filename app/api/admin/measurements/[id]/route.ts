import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    console.error('Measurement PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.progressLog.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Measurement DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
