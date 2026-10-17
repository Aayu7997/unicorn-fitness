import { GalleryClient } from './gallery-client'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function GalleryPage() {
  const allItems = await prisma.galleryImage.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

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
