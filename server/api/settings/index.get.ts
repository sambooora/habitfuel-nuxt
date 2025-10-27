import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const current = await prisma.setting.findFirst({
    where: { userId: user.id, active: true },
    orderBy: { updatedAt: 'desc' },
  })
  return current
})