import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Check if we have any users in the database
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: { id: true, email: true, authId: true, createdAt: true },
      take: 5
    })
    
    return {
      success: true,
      userCount,
      users,
      message: userCount === 0 ? 'No users found in database. Please sign up first.' : 'Users found in database'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Database error occurred'
    }
  } finally {
    await prisma.$disconnect()
  }
})