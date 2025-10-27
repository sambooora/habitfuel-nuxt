import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
const prisma = new PrismaClient()

const UpdateSchema = z.object({
  workDuration: z.number().int().min(60).max(60 * 60).optional(),
  shortBreakDuration: z.number().int().min(60).max(60 * 60).optional(),
  longBreakDuration: z.number().int().min(60).max(60 * 60).optional(),
  active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid payload', data: parsed.error.flatten() })

  // If setting active -> deactivate others
  if (parsed.data.active === true) {
    await prisma.setting.updateMany({ where: { userId: user.id, active: true }, data: { active: false } })
  }

  const updated = await prisma.setting.updateMany({
    where: { id, userId: user.id },
    data: parsed.data,
  })
  if (updated.count === 0) throw createError({ statusCode: 404, statusMessage: 'Setting not found' })
  return { ok: true }
})