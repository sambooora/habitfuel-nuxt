import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Get query parameters
    const query = getQuery(event)
    const { type, isActive, page = '1', limit = '50' } = query

    // Build where clause
    const where: any = { userId: user.id }
    
    // Type filter
    if (type && type !== 'all') {
      where.type = type
    }
    
    // Active filter
    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Pagination
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Fetch investments
    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        orderBy: { purchaseDate: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.investment.count({ where })
    ])

    return {
      investments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  } catch (error) {
    console.error('Error fetching investments:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch investments'
    })
  } finally {
    await prisma.$disconnect()
  }
})