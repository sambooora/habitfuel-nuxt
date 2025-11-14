import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'
import { transactionRateLimit } from '../../../utils/rateLimit'
import { sanitizeFinancialData } from '../../../utils/crypto'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for transaction creation
const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'INVESTMENT', 'DEBT_PAYMENT', 'ASSET_PURCHASE', 'ASSET_SALE']),
  amount: z.union([z.number(), z.string()]).transform((val) => {
    // Convert string to number if needed
    if (typeof val === 'string') {
      // Remove currency symbols and convert to number
      const numericValue = parseFloat(val.replace(/[^\d.-]/g, ''))
      if (isNaN(numericValue)) {
        throw new Error('Amount must be a valid number')
      }
      return numericValue
    }
    return val
  }).refine((val) => val > 0, {
    message: 'Amount must be positive'
  }),
  description: z.string().optional(),
  date: z.string().datetime(),
  categoryId: z.string().optional(), // Allow any string format, not just UUID
  isRecurring: z.boolean().optional().default(false),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional().default([]),
  attachments: z.array(z.string()).optional().default([])
})

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Apply rate limiting
    await transactionRateLimit(event, user.id)
    
    // Validate request body
    const body = await readBody(event)
    console.log('Received transaction data:', body)
    
    let validatedData
    try {
      validatedData = createTransactionSchema.parse(body)
      console.log('Validated transaction data:', validatedData)
    } catch (validationError) {
      console.error('Validation error:', validationError)
      if (validationError instanceof z.ZodError) {
        console.error('Validation details:', validationError.errors)
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation error',
          data: {
            message: 'Validation failed',
            errors: validationError.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        })
      }
      throw validationError
    }
    
    // Handle category - create if it doesn't exist or use existing
    let categoryId = validatedData.categoryId
    if (validatedData.categoryId) {
      console.log('Verifying category ownership for categoryId:', validatedData.categoryId, 'userId:', user.id)
      
      // Try to find existing category by ID
      let category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: user.id
        }
      })
      
      // If not found by ID, try to find by name and type for common categories
      if (!category) {
        console.log('Category not found by ID, trying to find by name and type')
        
        // Map common category names to types
        const categoryNameToType = {
          'Salary': 'INCOME',
          'Food & Dining': 'EXPENSE',
          'Transportation': 'EXPENSE',
          'Utilities': 'EXPENSE',
          'Entertainment': 'EXPENSE',
          'Healthcare': 'EXPENSE',
          'Shopping': 'EXPENSE',
          'Other': 'EXPENSE'
        }
        
        // Try to find by name and inferred type
        const inferredType = categoryNameToType[validatedData.categoryId] || 'EXPENSE'
        category = await prisma.category.findFirst({
          where: {
            userId: user.id,
            name: validatedData.categoryId,
            type: inferredType as any
          }
        })
        
        // If still not found, create a new category
        if (!category) {
          console.log('Creating new category for user:', user.id, 'name:', validatedData.categoryId, 'type:', inferredType)
          category = await prisma.category.create({
            data: {
              userId: user.id,
              name: validatedData.categoryId,
              type: inferredType as any,
              color: '#6366f1', // Default color
              icon: '📦' // Default icon
            }
          })
        }
      }
      
      console.log('Final category:', category)
      categoryId = category.id
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        ...validatedData,
        categoryId: categoryId, // Use the resolved categoryId
        date: new Date(validatedData.date),
        recurrenceEndDate: validatedData.recurrenceEndDate ? new Date(validatedData.recurrenceEndDate) : null
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

    // Log sanitized transaction data for security monitoring
    console.log('Transaction created by user:', user.id, 'Amount:', validatedData.amount)
    
    return sanitizeFinancialData(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create transaction'
    })
  } finally {
    await prisma.$disconnect()
  }
})