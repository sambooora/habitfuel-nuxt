import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
import { decryptString } from '~~/server/utils/crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')!
  const t = await prisma.task.findFirst({ where: { id, userId: user.id } })
  if (!t) throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  return {
    id: t.id,
    title: decryptString(t.titleEncrypted),
    done: t.done,
    focusSessions: t.focusSessions,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
})