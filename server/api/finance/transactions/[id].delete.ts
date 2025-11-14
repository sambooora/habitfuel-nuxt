import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Get transaction ID from route params
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required'
      })
    }
    
    // Verify transaction ownership
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id
      }
    })
    
    if (!existingTransaction) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found or does not belong to user'
      })
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id }
    })

    return { 
      success: true, 
      message: 'Transaction deleted successfully' 
    }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to delete transaction'
    })
  } finally {
    await prisma.$disconnect()
  }
})