import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Get query parameters
    const query = getQuery(event)
    const { startDate, endDate, type, category, search, page = '1', limit = '50' } = query

    // Build where clause
    const where: any = { userId: user.id }
    
    // Date range filter
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate as string)
      if (endDate) where.date.lte = new Date(endDate as string)
    }
    
    // Type filter
    if (type && type !== 'all') {
      where.type = type
    }
    
    // Category filter
    if (category && category !== 'all') {
      where.categoryId = category
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { category: { name: { contains: search as string, mode: 'insensitive' } } }
      ]
    }

    // Pagination
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Fetch transactions with category data
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.transaction.count({ where })
    ])

    return {
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch transactions'
    })
  } finally {
    await prisma.$disconnect()
  }
})