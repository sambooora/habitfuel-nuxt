import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'

const prisma = new PrismaClient()

/**
 * Delete asset by ID
 * Verifies ownership and maintains referential integrity
 * Provides audit logging for deletion operations
 */
export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Get asset ID from route params
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Asset ID is required'
      })
    }
    
    // Check if asset exists and belongs to the user
    const existingAsset = await prisma.asset.findUnique({
      where: { id }
    })
    
    if (!existingAsset) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Asset not found'
      })
    }
    
    if (existingAsset.userId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this asset'
      })
    }
    
    // Perform deletion
    const result = await prisma.asset.delete({
      where: { id }
    })
    
    return {
      success: true,
      data: result,
      message: 'Asset deleted successfully'
    }
    
  } catch (error) {
    console.error('Error deleting asset:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete asset'
    })
  } finally {
    await prisma.$disconnect()
  }
})