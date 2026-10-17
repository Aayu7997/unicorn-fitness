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

async function isAdmin(request: NextRequest): Promise<boolean> {
  const session = await getSessionFromRequest(request)
  return Boolean(session?.role === 'admin')
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
