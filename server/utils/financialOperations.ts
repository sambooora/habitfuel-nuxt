import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from './auth'
import { createError } from 'h3'
import { z } from 'zod'

const prisma = new PrismaClient()

/**
 * Financial operation types for audit logging
 */
export type FinancialOperationType = 
  | 'CREATE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION'
  | 'CREATE_INVESTMENT' | 'UPDATE_INVESTMENT' | 'DELETE_INVESTMENT'
  | 'CREATE_DEBT' | 'UPDATE_DEBT' | 'DELETE_DEBT'
  | 'CREATE_ASSET' | 'UPDATE_ASSET' | 'DELETE_ASSET'

/**
 * Resource types for financial operations
 */
export type FinancialResourceType = 'Transaction' | 'Investment' | 'Debt' | 'Asset'

/**
 * Standardized error responses for financial operations
 */
export class FinancialError extends Error {
  constructor(
    public statusCode: number,
    public statusMessage: string,
    public details?: any
  ) {
    super(statusMessage)
    this.name = 'FinancialError'
  }
}

/**
 * Common error scenarios for financial operations
 */
export const FinancialErrors = {
  NOT_FOUND: (resource: FinancialResourceType, id: string) => 
    new FinancialError(404, `${resource} not found`, { id }),
  
  FORBIDDEN: (resource: FinancialResourceType) => 
    new FinancialError(403, `You do not have permission to access this ${resource.toLowerCase()}`),
  
  VALIDATION_FAILED: (errors: any[]) => 
    new FinancialError(422, 'Validation failed', errors),
  
  INVALID_ID: (param: string) => 
    new FinancialError(400, `${param} is required or invalid`),
  
  REFERENTIAL_INTEGRITY: (resource: FinancialResourceType, relatedCount: number) =>
    new FinancialError(409, `Cannot delete ${resource.toLowerCase()} with ${relatedCount} related records`),
  
  DATABASE_ERROR: (operation: string) =>
    new FinancialError(500, `Failed to ${operation}`)
} as const

/**
 * Validates that a user owns a specific financial resource
 */
export async function validateResourceOwnership(
  resourceType: FinancialResourceType,
  resourceId: string,
  userId: string
): Promise<boolean> {
  try {
    let resource: { userId: string } | null = null
    
    switch (resourceType) {
      case 'Transaction':
        resource = await prisma.transaction.findUnique({
          where: { id: resourceId },
          select: { userId: true }
        })
        break
      case 'Investment':
        resource = await prisma.investment.findUnique({
          where: { id: resourceId },
          select: { userId: true }
        })
        break
      case 'Debt':
        resource = await prisma.debt.findUnique({
          where: { id: resourceId },
          select: { userId: true }
        })
        break
      case 'Asset':
        resource = await prisma.asset.findUnique({
          where: { id: resourceId },
          select: { userId: true }
        })
        break
      default:
        throw new Error(`Unknown resource type: ${resourceType}`)
    }
    
    if (!resource) {
      throw FinancialErrors.NOT_FOUND(resourceType, resourceId)
    }
    
    if (resource.userId !== userId) {
      throw FinancialErrors.FORBIDDEN(resourceType)
    }
    
    return true
  } catch (error) {
    if (error instanceof FinancialError) {
      throw error
    }
    throw FinancialErrors.DATABASE_ERROR('validate ownership')
  }
}

/**
 * Logs financial operations for audit purposes
 * Note: auditLog table is not implemented yet, so this is a placeholder
 */
export async function logFinancialOperation(
  userId: string,
  action: FinancialOperationType,
  resourceType: FinancialResourceType,
  resourceId: string,
  changes: any,
  metadata?: any
): Promise<void> {
  // TODO: Implement audit logging when auditLog table is created
  console.log(`Audit log: ${action} ${resourceType} ${resourceId} by ${userId}`, changes, metadata)
}

/**
 * Checks for related records before deletion
 */
export async function checkRelatedRecords(
  resourceType: FinancialResourceType,
  resourceId: string,
  transactionTypes?: string[]
): Promise<number> {
  try {
    const foreignKey = `${resourceType.toLowerCase()}Id`
    
    if (!transactionTypes) {
      // Get default transaction types based on resource type
      switch (resourceType) {
        case 'Debt':
          transactionTypes = ['DEBT_PAYMENT', 'DEBT_INTEREST', 'DEBT_PRINCIPAL']
          break
        case 'Investment':
          transactionTypes = ['INVESTMENT_BUY', 'INVESTMENT_SELL', 'INVESTMENT_DIVIDEND']
          break
        case 'Asset':
          transactionTypes = ['ASSET_PURCHASE', 'ASSET_SALE', 'ASSET_DEPRECIATION']
          break
        default:
          transactionTypes = []
      }
    }
    
    const relatedCount = await prisma.transaction.count({
      where: {
        [foreignKey]: resourceId,
        ...(transactionTypes && transactionTypes.length > 0 && {
          type: { in: transactionTypes as any }
        })
      }
    })
    
    return relatedCount
  } catch (error) {
    console.error('Failed to check related records:', error)
    return 0
  }
}

/**
 * Handles referential integrity during deletion
 */
export async function handleDeletionReferentialIntegrity(
  resourceType: FinancialResourceType,
  resourceId: string,
  userId: string,
  options: {
    cascade?: boolean
    nullify?: boolean
    transactionTypes?: string[]
  } = {}
): Promise<{ deletedCount: number; strategy: string }> {
  const { cascade = true, nullify = false, transactionTypes } = options
  
  try {
    const foreignKey = `${resourceType.toLowerCase()}Id`
    
    if (cascade) {
      // Delete related transactions
      const deletedCount = await prisma.transaction.deleteMany({
        where: {
          [foreignKey]: resourceId,
          ...(transactionTypes && transactionTypes.length > 0 && {
            type: { in: transactionTypes as any }
          })
        }
      })
      
      return { deletedCount, strategy: 'cascade' }
    } else if (nullify) {
      // Set foreign key to null instead of deleting
      const updatedCount = await prisma.transaction.updateMany({
        where: {
          [foreignKey]: resourceId
        },
        data: {
          [foreignKey]: null
        }
      })
      
      return { deletedCount: updatedCount.count, strategy: 'nullify' }
    }
    
    return { deletedCount: 0, strategy: 'none' }
  } catch (error) {
    console.error('Failed to handle referential integrity:', error)
    throw FinancialErrors.DATABASE_ERROR('handle referential integrity')
  }
}

/**
 * Standardized response format for financial operations
 */
export interface FinancialOperationResponse<T = any> {
  success: boolean
  data?: T
  message: string
  details?: {
    [key: string]: any
  }
  errors?: any[]
}

/**
 * Creates standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string,
  details?: any
): FinancialOperationResponse<T> {
  return {
    success: true,
    data,
    message,
    details
  }
}

/**
 * Creates standardized error response
 */
export function createErrorResponse(
  message: string,
  errors?: any[],
  details?: any
): FinancialOperationResponse {
  return {
    success: false,
    message,
    errors,
    details
  }
}

/**
 * Validates financial input data
 */
export function validateFinancialInput(
  data: any,
  schema: any,
  resourceType: FinancialResourceType
): any {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw FinancialErrors.VALIDATION_FAILED(error.issues)
    }
    throw FinancialErrors.DATABASE_ERROR(`validate ${resourceType.toLowerCase()}`)
  }
}

/**
 * Handles common error scenarios in financial operations
 */
export function handleFinancialError(error: any, operation: string): never {
  if (error instanceof FinancialError) {
    throw createError({
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: error.details
    })
  }
  
  if (error instanceof Error && 'statusCode' in error) {
    throw error
  }
  
  throw createError({
    statusCode: 500,
    statusMessage: `Failed to ${operation}`
  })
}

export default {
  FinancialError,
  FinancialErrors,
  validateResourceOwnership,
  logFinancialOperation,
  checkRelatedRecords,
  handleDeletionReferentialIntegrity,
  createSuccessResponse,
  createErrorResponse,
  validateFinancialInput,
  handleFinancialError
}