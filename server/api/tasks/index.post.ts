import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
import { encryptString } from '~~/server/utils/crypto'

const prisma = new PrismaClient()
const TaskCreateSchema = z.object({
  title: z.string().min(1).max(256),
  done: z.boolean().optional(),
  focusSessions: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = TaskCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task payload', data: parsed.error.flatten() })
  }
  const { title, done = false, focusSessions = 0 } = parsed.data
  const created = await prisma.task.create({
    data: {
      userId: user.id,
      titleEncrypted: encryptString(title),
      done,
      focusSessions,
    },
  })
  return { id: created.id }
})