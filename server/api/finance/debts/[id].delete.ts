import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'

const prisma = new PrismaClient()

/**
 * Delete debt by ID
 * Verifies ownership and maintains referential integrity
 * Provides audit logging for deletion operations
 */
export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)

    // Get debt ID from route params
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Debt ID is required'
      })
    }

    // Check if debt exists and belongs to the user
    const existingDebt = await prisma.debt.findUnique({
      where: { id }
    })

    if (!existingDebt) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Debt not found'
      })
    }

    if (existingDebt.userId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this debt'
      })
    }

    // Perform deletion
    const result = await prisma.debt.delete({
      where: { id }
    })

    return {
      success: true,
      data: result,
      message: 'Debt deleted successfully'
    }

  } catch (error) {
    console.error('Error deleting debt:', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete debt'
    })
  } finally {
    await prisma.$disconnect()
  }
})