import { GalleryClient } from './gallery-client'
import { prisma } from '@/lib/prisma'
import { isProductionBuild } from '@/lib/utils'
import type { GalleryImage } from '@prisma/client'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function GalleryPage() {
  let allItems: GalleryImage[] = []

  try {
    allItems = await prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
  } catch (e) {
    if (isProductionBuild()) {
      console.warn('Prisma offline during build, using empty gallery fallback')
    } else {
      // Rethrow at runtime so Next.js ISR retains the last successful page
      throw e
    }
  }

  // Separate video highlights from standard gallery grid images
  const videoHighlights = allItems.filter((i) => i.category === 'Video Highlight')
  const galleryItems = allItems.filter((i) => i.category !== 'Video Highlight')

  return (
    <GalleryClient 
      galleryItems={galleryItems} 
      videoHighlights={videoHighlights} 
    />
  )
}
