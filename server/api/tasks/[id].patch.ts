import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
import { encryptString } from '~~/server/utils/crypto'

const prisma = new PrismaClient()
const TaskUpdateSchema = z.object({
  title: z.string().min(1).max(256).optional(),
  done: z.boolean().optional(),
  focusSessions: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const parsed = TaskUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task payload', data: parsed.error.flatten() })
  }

  const data: any = {}
  if (parsed.data.title !== undefined) data.titleEncrypted = encryptString(parsed.data.title)
  if (parsed.data.done !== undefined) data.done = parsed.data.done
  if (parsed.data.focusSessions !== undefined) data.focusSessions = parsed.data.focusSessions

  // Ownership check via where clause
  const updated = await prisma.task.updateMany({
    where: { id, userId: user.id },
    data,
  })
  if (updated.count === 0) throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  return { ok: true }
})