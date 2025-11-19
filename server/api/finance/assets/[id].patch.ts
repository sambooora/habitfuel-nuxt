import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from '../../../utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for asset update - all fields optional for partial updates
const updateAssetSchema = z.object({
  type: z.enum(['REAL_ESTATE', 'VEHICLE', 'INVESTMENT', 'CASH', 'BANK_ACCOUNT', 'DIGITAL_ASSET', 'PRECIOUS_METAL', 'OTHER']).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  purchasePrice: z.number().positive().optional(),
  currentValue: z.number().positive().optional().nullable(),
  purchaseDate: z.string().datetime().optional(),
  depreciationRate: z.number().min(0).max(100).optional().nullable(),
  status: z.enum(['ACTIVE', 'SOLD', 'DEPRECIATED', 'DAMAGED', 'LOST']).optional(),
  location: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  warrantyExpiry: z.string().datetime().optional().nullable(),
  insuranceInfo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional()
})

/**
 * Update asset by ID
 * Validates input data, checks ownership, and updates all relevant fields
 * Handles date conversions and maintains data integrity
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

    // Validate request body
    const body = await readBody(event)
    const validatedData = updateAssetSchema.parse(body)

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
        statusMessage: 'You do not have permission to update this asset'
      })
    }

    // Prepare update data with date conversions
    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects if provided
    if (validatedData.purchaseDate) {
      updateData.purchaseDate = new Date(validatedData.purchaseDate)
    }
    if (validatedData.warrantyExpiry !== undefined) {
      updateData.warrantyExpiry = validatedData.warrantyExpiry ? new Date(validatedData.warrantyExpiry) : null
    }

    // Perform the update
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: updateData
    })

    return {
      success: true,
      data: updatedAsset,
      message: 'Asset updated successfully'
    }

  } catch (error) {
    console.error('Error updating asset:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation error',
        data: error.issues
      })
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update asset'
    })
  } finally {
    await prisma.$disconnect()
  }
})