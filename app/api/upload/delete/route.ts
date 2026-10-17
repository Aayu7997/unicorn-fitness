import { requireAdmin } from '@/lib/session'
import { deleteCloudinaryImage } from '@/lib/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const { publicId } = await request.json()
    if (!publicId) return NextResponse.json({ error: 'publicId required' }, { status: 400 })
    await deleteCloudinaryImage(publicId)
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'UN-') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
