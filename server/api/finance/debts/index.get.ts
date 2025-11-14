import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Get query parameters
    const query = getQuery(event)
    const { status, page = '1', limit = '50' } = query

    // Build where clause
    const where: any = { userId: user.id }
    
    // Status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Pagination
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Fetch debts
    const [debts, total] = await Promise.all([
      prisma.debt.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.debt.count({ where })
    ])

    return {
      debts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  } catch (error) {
    console.error('Error fetching debts:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch debts'
    })
  } finally {
    await prisma.$disconnect()
  }
})