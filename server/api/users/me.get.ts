import type { User } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event): Promise<User> => {
  return await requireAuthUser(event)
})