import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'
const prisma = new PrismaClient()

const CreateSchema = z.object({
  workDuration: z.number().int().min(60).max(60 * 60),
  shortBreakDuration: z.number().int().min(60).max(60 * 60),
  longBreakDuration: z.number().int().min(60).max(60 * 60),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid payload', data: parsed.error.flatten() })

  // Deactivate previous active
  await prisma.setting.updateMany({ where: { userId: user.id, active: true }, data: { active: false } })
  // Create new active
  const s = await prisma.setting.create({ data: { userId: user.id, ...parsed.data, active: true } })
  return s
})