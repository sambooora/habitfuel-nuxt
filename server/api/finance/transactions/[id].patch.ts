import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for transaction update
const updateTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'INVESTMENT', 'DEBT_PAYMENT', 'ASSET_PURCHASE', 'ASSET_SALE']).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional().nullable(),
  recurrenceEndDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional()
})

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
    
    // Validate request body
    const body = await readBody(event)
    const validatedData = updateTransactionSchema.parse(body)
    
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
    
    // Verify category ownership if provided
    if (validatedData.categoryId !== undefined) {
      if (validatedData.categoryId === null) {
        // Allow setting category to null
      } else {
        const category = await prisma.category.findFirst({
          where: {
            id: validatedData.categoryId,
            userId: user.id
          }
        })
        
        if (!category) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid category or category does not belong to user'
          })
        }
      }
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        recurrenceEndDate: validatedData.recurrenceEndDate !== undefined 
          ? (validatedData.recurrenceEndDate ? new Date(validatedData.recurrenceEndDate) : null)
          : undefined
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    })

    return transaction
  } catch (error) {
    console.error('Error updating transaction:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to update transaction'
    })
  } finally {
    await prisma.$disconnect()
  }
})