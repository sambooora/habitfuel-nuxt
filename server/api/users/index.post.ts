import { PrismaClient } from '@prisma/client'
import type { User } from '@prisma/client'

const prisma = new PrismaClient()

interface CreateUserBody {
  email: string
  name?: string
}

export default defineEventHandler(async (event): Promise<User> => {
  const body = await readBody<CreateUserBody>(event)
  return await prisma.user.create({ data: body })
})
