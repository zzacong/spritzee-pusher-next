import { PrismaClient } from '@prisma/client'
import { env } from '$server/env.mjs'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
