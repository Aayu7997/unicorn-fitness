import { defineConfig } from '@prisma/config'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local so Prisma CLI can access DATABASE_URL
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
