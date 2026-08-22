import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Ensure that we don't instantiate a new client on every hot reload in dev
const libsql = createClient({
  url: 'file:dev.db',
})
const adapter = new PrismaLibSql({
  url: 'file:dev.db',
})

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
