import { PrismaClient } from '@prisma/client'
import type { User } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (): Promise<User[]> => {
  return await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
})
