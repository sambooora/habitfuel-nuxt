import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for investment creation
const createInvestmentSchema = z.object({
  type: z.enum(['STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'REAL_ESTATE', 'CRYPTO', 'COMMODITY', 'OTHER']),
  name: z.string().min(1).max(255),
  symbol: z.string().optional(),
  quantity: z.number().positive().optional(),
  purchasePrice: z.number().positive(),
  currentPrice: z.number().positive().optional(),
  totalInvested: z.number().positive(),
  purchaseDate: z.string().datetime(),
  broker: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
})

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Validate request body
    const body = await readBody(event)
    const validatedData = createInvestmentSchema.parse(body)
    
    // Calculate current value if current price is provided
    let currentValue = validatedData.currentPrice && validatedData.quantity 
      ? validatedData.currentPrice * validatedData.quantity 
      : null

    // Create investment
    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        ...validatedData,
        currentValue,
        purchaseDate: new Date(validatedData.purchaseDate)
      }
    })

    return investment
  } catch (error) {
    console.error('Error creating investment:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create investment'
    })
  } finally {
    await prisma.$disconnect()
  }
})