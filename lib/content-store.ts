import { prisma } from './prisma'
import { defaultSiteContent, type SiteContent } from './site-content'
import type { Prisma } from '@prisma/client'

export async function getSiteContent(): Promise<SiteContent> {
  const row = await prisma.siteContent.findUnique({
    where: { key: 'main' },
  })

  if (!row) {
    await prisma.siteContent.create({
      data: {
        key: 'main',
        content: defaultSiteContent as unknown as Prisma.InputJsonValue,
      },
    })
    return defaultSiteContent
  }

  return row.content as unknown as SiteContent
}

export async function updateSiteContent(nextContent: SiteContent): Promise<SiteContent> {
  const jsonContent = nextContent as unknown as Prisma.InputJsonValue
  await prisma.siteContent.upsert({
    where: { key: 'main' },
    create: { key: 'main', content: jsonContent },
    update: { content: jsonContent },
  })

  return nextContent
}
