import { requireUser } from '@/lib/session'
import { generateUploadSignature, uploadToCloudinary } from '@/lib/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await requireUser()
    const folder = request.nextUrl.searchParams.get('folder') ?? 'gym'
    const sig = generateUploadSignature(folder)
    return NextResponse.json(sig)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser()

    const contentType = request.headers.get('content-type') || ''
    let fileBufferOrString: Buffer | string | null = null
    let folder = 'gym'

    if (contentType.includes('application/json')) {
      const body = await request.json()
      fileBufferOrString = body.file || body.image || null
      if (body.folder) folder = body.folder
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const f = formData.get('folder') as string | null
      if (f) folder = f

      if (file) {
        const arrayBuffer = await file.arrayBuffer()
        fileBufferOrString = Buffer.from(arrayBuffer)
      }
    }

    if (!fileBufferOrString) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    const result = await uploadToCloudinary(fileBufferOrString, folder)

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error'
    console.error('API Upload error:', error)
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
