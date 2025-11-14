import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for debt creation
const createDebtSchema = z.object({
  lenderName: z.string().min(1).max(255),
  principalAmount: z.number().positive(),
  interestRate: z.number().min(0).max(100).optional(),
  currentBalance: z.number().positive(),
  monthlyPayment: z.number().positive().optional(),
  startDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  nextPaymentDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'PAID', 'OVERDUE', 'DEFAULTED']).optional().default('ACTIVE'),
  collateral: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
})

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Validate request body
    const body = await readBody(event)
    const validatedData = createDebtSchema.parse(body)
    
    // Create debt
    const debt = await prisma.debt.create({
      data: {
        userId: user.id,
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        nextPaymentDate: validatedData.nextPaymentDate ? new Date(validatedData.nextPaymentDate) : null
      }
    })

    return debt
  } catch (error) {
    console.error('Error creating debt:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create debt'
    })
  } finally {
    await prisma.$disconnect()
  }
})