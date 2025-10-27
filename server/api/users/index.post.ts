import { PrismaClient } from '@prisma/client'
import type { User } from '@prisma/client'
import { requireAuthUser } from '~~/server/utils/auth'

const prisma = new PrismaClient()

interface CreateUserBody {
  email: string
  name?: string
}

export default defineEventHandler(async (event): Promise<User> => {
  // Returns authenticated user, creating if first-time
  const user = await requireAuthUser(event)
  return user
})
