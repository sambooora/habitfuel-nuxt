import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')!
  const deleted = await prisma.task.deleteMany({ where: { id, userId: user.id } })
  if (deleted.count === 0) throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  return { ok: true }
})