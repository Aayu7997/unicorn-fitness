const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const hash = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'unicornfitness3111@gmail.com' },
    update: { passwordHash: hash, role: 'admin', name: 'Lokesh Meena' },
    create: {
      email: 'unicornfitness3111@gmail.com',
      name: 'Lokesh Meena',
      passwordHash: hash,
      role: 'admin',
    },
  });
  console.log('Admin user created:', admin.id, admin.email, admin.role);
  
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
