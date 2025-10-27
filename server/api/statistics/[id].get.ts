import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')!
  const s = await prisma.statistic.findFirst({ where: { id, userId: user.id } })
  if (!s) throw createError({ statusCode: 404, statusMessage: 'Statistic not found' })
  return s
})