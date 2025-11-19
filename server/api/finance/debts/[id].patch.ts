import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for debt update - all fields optional for partial updates
const updateDebtSchema = z.object({
  lenderName: z.string().min(1).max(255).optional(),
  principalAmount: z.number().positive().optional(),
  interestRate: z.number().min(0).max(100).optional().nullable(),
  currentBalance: z.number().positive().optional(),
  monthlyPayment: z.number().positive().optional().nullable(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  nextPaymentDate: z.string().datetime().optional().nullable(),
  status: z.enum(['ACTIVE', 'PAID', 'OVERDUE', 'DEFAULTED']).optional(),
  collateral: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional()
})

/**
 * Update debt by ID
 * Validates input data, checks ownership, and updates all relevant fields
 * Handles date conversions and maintains data integrity
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

    // Validate request body
    const body = await readBody(event)
    const validatedData = updateDebtSchema.parse(body)

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
        statusMessage: 'You do not have permission to update this debt'
      })
    }

    // Prepare update data with date conversions
    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects if provided
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null
    }
    if (validatedData.nextPaymentDate !== undefined) {
      updateData.nextPaymentDate = validatedData.nextPaymentDate ? new Date(validatedData.nextPaymentDate) : null
    }

    // Perform the update
    const updatedDebt = await prisma.debt.update({
      where: { id },
      data: updateData
    })

    return {
      success: true,
      data: updatedDebt,
      message: 'Debt updated successfully'
    }

  } catch (error) {
    console.error('Error updating debt:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation error',
        data: error.errors
      })
    }

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update debt'
    })
  } finally {
    await prisma.$disconnect()
  }
})