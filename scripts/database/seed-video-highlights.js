const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const existing = await prisma.galleryImage.findFirst({ where: { category: 'Video Highlight' } });
  if (!existing) {
    await prisma.galleryImage.createMany({
      data: [
        {
          title: 'Facility Tour',
          category: 'Video Highlight',
          imageUrl: '',
          imagePublicId: 'placeholder1',
          sortOrder: 0
        },
        {
          title: 'Member Testimonials',
          category: 'Video Highlight',
          imageUrl: '',
          imagePublicId: 'placeholder2',
          sortOrder: 1
        }
      ]
    });
    console.log('Seeded video highlights!');
  } else {
    console.log('Already seeded');
  }
}
seed().catch(console.error).finally(() => prisma.$disconnect());
