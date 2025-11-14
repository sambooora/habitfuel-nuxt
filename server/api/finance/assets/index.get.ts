import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from './../../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Get query parameters
    const query = getQuery(event)
    const { type, status, page = '1', limit = '50' } = query

    // Build where clause
    const where: any = { userId: user.id }
    
    // Type filter
    if (type && type !== 'all') {
      where.type = type
    }
    
    // Status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Pagination
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Fetch assets
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { purchaseDate: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.asset.count({ where })
    ])

    return {
      assets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  } catch (error) {
    console.error('Error fetching assets:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch assets'
    })
  } finally {
    await prisma.$disconnect()
  }
})