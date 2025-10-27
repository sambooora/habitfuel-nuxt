import { z } from 'zod'
import { PrismaClient, PeriodType } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'

const prisma = new PrismaClient()
const CreateSchema = z.object({
  periodType: z.enum(['DAY', 'WEEK', 'MONTH']),
  periodStart: z.string().datetime(),
  workSessionsCompleted: z.number().int().min(0).default(0),
  elapsedWorkSeconds: z.number().int().min(0).default(0),
  tasksCompleted: z.number().int().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload', data: parsed.error.flatten() })
  }
  const d = parsed.data
  const upserted = await prisma.statistic.upsert({
    where: {
      userId_periodType_periodStart: {
        userId: user.id,
        periodType: d.periodType as PeriodType,
        periodStart: new Date(d.periodStart),
      },
    },
    update: {
      workSessionsCompleted: d.workSessionsCompleted,
      elapsedWorkSeconds: d.elapsedWorkSeconds,
      tasksCompleted: d.tasksCompleted,
    },
    create: {
      userId: user.id,
      periodType: d.periodType as PeriodType,
      periodStart: new Date(d.periodStart),
      workSessionsCompleted: d.workSessionsCompleted,
      elapsedWorkSeconds: d.elapsedWorkSeconds,
      tasksCompleted: d.tasksCompleted,
    },
  })
  return upserted
})