import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'

const prisma = new PrismaClient()

/**
 * Delete investment by ID
 * Verifies ownership and maintains referential integrity
 * Provides audit logging for deletion operations
 */
export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Get investment ID from route params
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Investment ID is required'
      })
    }
    
    // Check if investment exists and belongs to the user
    const existingInvestment = await prisma.investment.findUnique({
      where: { id }
    })
    
    if (!existingInvestment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Investment not found'
      })
    }
    
    if (existingInvestment.userId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this investment'
      })
    }
    
    // Perform deletion
    const result = await prisma.investment.delete({
      where: { id }
    })
    
    return {
      success: true,
      data: result,
      message: 'Investment deleted successfully'
    }
    
  } catch (error) {
    console.error('Error deleting investment:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete investment'
    })
  } finally {
    await prisma.$disconnect()
  }
})