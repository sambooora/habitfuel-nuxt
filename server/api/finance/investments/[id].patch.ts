import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for investment update - all fields optional for partial updates
const updateInvestmentSchema = z.object({
  type: z.enum(['STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'REAL_ESTATE', 'CRYPTO', 'COMMODITY', 'OTHER']).optional(),
  name: z.string().min(1).max(255).optional(),
  symbol: z.string().optional().nullable(),
  quantity: z.number().positive().optional().nullable(),
  purchasePrice: z.number().positive().optional(),
  currentPrice: z.number().positive().optional().nullable(),
  totalInvested: z.number().positive().optional(),
  purchaseDate: z.string().datetime().optional(),
  broker: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

/**
 * Update investment by ID
 * Validates input data, checks ownership, and updates all relevant fields
 * Handles current value calculation and maintains data integrity
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

    // Validate request body
    const body = await readBody(event)
    const validatedData = updateInvestmentSchema.parse(body)

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
        statusMessage: 'You do not have permission to update this investment'
      })
    }

    // Calculate current value if current price and quantity are provided
    let currentValue = validatedData.currentValue
    if (validatedData.currentPrice !== undefined && validatedData.quantity !== undefined) {
      currentValue = validatedData.currentPrice * (validatedData.quantity || 0)
    } else if (validatedData.currentPrice !== undefined && validatedData.quantity === undefined) {
      // Use existing quantity if only current price is updated
      currentValue = validatedData.currentPrice * (existingInvestment.quantity?.toNumber() || 0)
    } else if (validatedData.quantity !== undefined && validatedData.currentPrice === undefined && existingInvestment.currentPrice) {
      // Use existing current price if only quantity is updated
      currentValue = existingInvestment.currentPrice.toNumber() * (validatedData.quantity || 0)
    }

    // Prepare update data with current value calculation
    const updateData: any = { ...validatedData }
    if (currentValue !== undefined) {
      updateData.currentValue = currentValue
    }

    // Convert date string to Date object if provided
    if (validatedData.purchaseDate) {
      updateData.purchaseDate = new Date(validatedData.purchaseDate)
    }

    // Update investment
    const updatedInvestment = await prisma.investment.update({
      where: { id },
      data: updateData
    })

    return {
      success: true,
      data: updatedInvestment,
      message: 'Investment updated successfully'
    }

  } catch (error) {
    console.error('Error updating investment:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation error',
        data: error.issues
      })
    }

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update investment'
    })
  } finally {
    await prisma.$disconnect()
  }
})