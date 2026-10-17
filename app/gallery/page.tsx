import { GalleryClient } from './gallery-client'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function GalleryPage() {
  let allItems: any[] = [];
  try {
    allItems = await prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  } catch (e) {
    console.warn("Prisma offline during build/render, using empty gallery fallback:", (e as any)?.message || e);
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
