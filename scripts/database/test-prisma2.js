const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig, Pool } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('No DATABASE_URL');
    return;
  }
  try {
    const adapter = new PrismaNeon({ connectionString });
    const prisma = new PrismaClient({ adapter });
    const user = await prisma.user.findFirst();
    console.log("User:", user);
  } catch(e) {
    console.error("ERROR 1:", e);
    try {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaNeon(pool);
      const prisma = new PrismaClient({ adapter });
      const user = await prisma.user.findFirst();
      console.log("User 2:", user);
    } catch (e2) {
      console.error("ERROR 2:", e2);
    }
  }
}
main();
