const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Found user:", user?.email);
    
    // Simulate what happens in auth.ts
    // await prisma.user.create({
    //   data: {
    //     email: 'test_fake_google@example.com',
    //     name: 'Test',
    //     authProvider: 'google',
    //     googleId: '123456789'
    //   }
    // });
    // console.log("Created test user");
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
