import { prisma } from '../lib/prisma'

const defaultGallery = [
  { category: 'Training', imageUrl: '/images/training-area.jpg', imagePublicId: 'training-area', sortOrder: 1 },
  { category: 'Classes', imageUrl: '/images/group-class.jpg', imagePublicId: 'group-class', sortOrder: 2 },
  { category: 'Cardio', imageUrl: '/images/cardio-zone.jpg', imagePublicId: 'cardio-zone', sortOrder: 3 },
  { category: 'Yoga', imageUrl: '/images/yoga-studio.jpg', imagePublicId: 'yoga-studio', sortOrder: 4 },
  { category: 'Strength', imageUrl: '/images/program-strength.jpg', imagePublicId: 'program-strength', sortOrder: 5 },
  { category: 'Facilities', imageUrl: '/images/feature-before-after.jpg', imagePublicId: 'feature-before-after', sortOrder: 6 },
]

async function main() {
  const count = await prisma.galleryImage.count()
  if (count === 0) {
    console.log('Seeding default gallery images...')
    for (const img of defaultGallery) {
      await prisma.galleryImage.create({
        data: img
      })
    }
    console.log('Successfully seeded gallery images.')
  } else {
    console.log(`Gallery already contains ${count} images. Skipping seed.`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
