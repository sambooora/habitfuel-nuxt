import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
import { decryptString } from '~~/server/utils/crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const items = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  return items.map(t => ({
    id: t.id,
    title: decryptString(t.titleEncrypted),
    done: t.done,
    focusSessions: t.focusSessions,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }))
})