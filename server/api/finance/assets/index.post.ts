import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for asset creation
const createAssetSchema = z.object({
  type: z.enum(['REAL_ESTATE', 'VEHICLE', 'INVESTMENT', 'CASH', 'BANK_ACCOUNT', 'DIGITAL_ASSET', 'PRECIOUS_METAL', 'OTHER']),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  purchasePrice: z.number().positive(),
  currentValue: z.number().positive().optional(),
  purchaseDate: z.string().datetime(),
  depreciationRate: z.number().min(0).max(100).optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'DEPRECIATED', 'DAMAGED', 'LOST']).optional().default('ACTIVE'),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  insuranceInfo: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  attachments: z.array(z.string()).optional().default([])
})

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Validate request body
    const body = await readBody(event)
    const validatedData = createAssetSchema.parse(body)
    
    // Create asset
    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        ...validatedData,
        purchaseDate: new Date(validatedData.purchaseDate),
        warrantyExpiry: validatedData.warrantyExpiry ? new Date(validatedData.warrantyExpiry) : null
      }
    })

    return asset
  } catch (error) {
    console.error('Error creating asset:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create asset'
    })
  } finally {
    await prisma.$disconnect()
  }
})