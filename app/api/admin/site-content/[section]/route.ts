import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-request'
import { getSiteContent, updateSiteContent } from '@/lib/content-store'
import type { SiteContent } from '@/lib/site-content'

type EditableSection = keyof SiteContent

function getSectionParam(section: string): EditableSection | null {
  const validSections: EditableSection[] = ['brand', 'home', 'pricing', 'trainers', 'faqs', 'programs', 'testimonials']
  const s = section as EditableSection
  return validSections.includes(s) ? s : null
}

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; status?: number; error?: string }> {
  const session = await getSessionFromRequest(request)
  if (!session) return { authorized: false, status: 401, error: 'Unauthorized' }
  if (session.role !== 'admin') return { authorized: false, status: 403, error: 'Forbidden' }
  return { authorized: true }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { section: sectionParam } = await params
    const section = getSectionParam(sectionParam)
    if (!section) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    const content = await getSiteContent()
    revalidatePath('/', 'layout'); return NextResponse.json(content[section])
  } catch {
    return NextResponse.json({ error: 'Failed to load section content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { section: sectionParam } = await params
    const section = getSectionParam(sectionParam)
    if (!section) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    const body = await request.json()
    const content = await getSiteContent()
    const nextContent = {
      ...content,
      [section]: body,
    } as SiteContent

    await updateSiteContent(nextContent)
    revalidatePath('/', 'layout'); return NextResponse.json(nextContent[section])
  } catch {
    return NextResponse.json({ error: 'Failed to save section content' }, { status: 500 })
  }
}
