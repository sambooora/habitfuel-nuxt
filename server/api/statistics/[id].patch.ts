import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
const prisma = new PrismaClient()

const UpdateSchema = z.object({
  workSessionsCompleted: z.number().int().min(0).optional(),
  elapsedWorkSeconds: z.number().int().min(0).optional(),
  tasksCompleted: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid payload', data: parsed.error.flatten() })
  const updated = await prisma.statistic.updateMany({
    where: { id, userId: user.id },
    data: parsed.data,
  })
  if (updated.count === 0) throw createError({ statusCode: 404, statusMessage: 'Statistic not found' })
  return { ok: true }
})