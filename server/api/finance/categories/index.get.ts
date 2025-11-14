import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from './../../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Fetch categories for the user
    const categories = await prisma.category.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        type: true
      }
    })
    
    return {
      categories
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch categories'
    })
  } finally {
    await prisma.$disconnect()
  }
})