import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event): Promise<User> => {
  const id = getRouterParam(event, 'id')!
  return await prisma.user.delete({ where: { id } })
})
