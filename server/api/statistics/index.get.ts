import { z } from 'zod'
import { PrismaClient, PeriodType } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'

const prisma = new PrismaClient()
const QuerySchema = z.object({
  periodType: z.enum(['DAY', 'WEEK', 'MONTH']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = getQuery(event)
  const parsed = QuerySchema.safeParse(query)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid query', data: parsed.error.flatten() })
  }
  const { periodType, from, to } = parsed.data
  const where: any = { userId: user.id }
  if (periodType) where.periodType = periodType as PeriodType
  if (from || to) {
    where.periodStart = {}
    if (from) where.periodStart.gte = new Date(from)
    if (to) where.periodStart.lte = new Date(to)
  }
  return await prisma.statistic.findMany({
    where,
    orderBy: { periodStart: 'desc' },
  })
})