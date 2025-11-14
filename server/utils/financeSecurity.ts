import { requireAuthUser } from './auth'
import { financialOperationRateLimit } from './rateLimit'
import { sanitizeFinancialData } from './crypto'

/**
 * Security middleware for financial operations
 * Validates user permissions, applies rate limiting, and sanitizes data
 */
export async function requireFinancialAccess(event: any, requiredPermission?: string) {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Apply rate limiting for financial operations
    await financialOperationRateLimit(event, user.id)
    
    // Get user agent and IP for security logging
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
    
    // Log security access for audit trail
    console.log(`[FINANCE SECURITY] User: ${user.id}, IP: ${ip}, UserAgent: ${userAgent}, Action: ${event.path}`)
    
    // Validate request origin (basic CSRF protection)
    const origin = getHeader(event, 'origin')
    const referer = getHeader(event, 'referer')
    
    if (origin || referer) {
      const runtimeConfig = useRuntimeConfig()
      const allowedOrigins = [
        runtimeConfig.public.appUrl || 'http://localhost:3000',
        'https://habitfuel.app' // Add your production domain
      ]
      
      const requestOrigin = origin || (referer ? new URL(referer).origin : null)
      
      if (requestOrigin && !allowedOrigins.some(allowed => requestOrigin.includes(allowed))) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Request origin not allowed'
        })
      }
    }
    
    // Additional permission checks can be added here
    if (requiredPermission) {
      // Check if user has specific financial permission
      // This can be extended based on your permission system
      console.log(`[FINANCE SECURITY] Permission check: ${requiredPermission} for user: ${user.id}`)
    }
    
    return user
  } catch (error) {
    console.error('[FINANCE SECURITY] Access denied:', error)
    
    // Log security violations
    const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
    console.warn(`[FINANCE SECURITY VIOLATION] IP: ${ip}, Path: ${event.path}, Error: ${error.message}`)
    
    throw createError({
      statusCode: error.statusCode || 403,
      statusMessage: error.statusMessage || 'Access denied to financial data'
    })
  }
}

/**
 * Validate financial data input for security
 */
export function validateFinancialInput(data: any, allowedFields: string[] = []) {
  if (!data || typeof data !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid financial data format'
    })
  }
  
  // Check for potentially malicious content
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i,
    /\{\s*\{/i, // Potential object injection
    /\[\s*\[/i  // Potential array injection
  ]
  
  const stringData = JSON.stringify(data)
  for (const pattern of maliciousPatterns) {
    if (pattern.test(stringData)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Potentially malicious content detected in financial data'
      })
    }
  }
  
  // Validate field names if specified
  if (allowedFields.length > 0) {
    const dataFields = Object.keys(data)
    const invalidFields = dataFields.filter(field => !allowedFields.includes(field))
    
    if (invalidFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid fields in financial data: ${invalidFields.join(', ')}`
      })
    }
  }
  
  return sanitizeFinancialData(data)
}

/**
 * Create audit log for financial operations
 */
export async function logFinancialOperation(
  userId: string, 
  operation: string, 
  details: any, 
  result: 'success' | 'failure' = 'success'
) {
  try {
    const sanitizedDetails = sanitizeFinancialData(details)
    
    // In a production environment, you would store this in a database
    // For now, we'll log to console with appropriate security measures
    console.log(`[FINANCE AUDIT] User: ${userId}, Operation: ${operation}, Result: ${result}, Details:`, sanitizedDetails)
    
    // You could also send this to a secure logging service
    // await sendToAuditLog({ userId, operation, details: sanitizedDetails, result, timestamp: new Date() })
    
  } catch (error) {
    console.error('[FINANCE AUDIT] Failed to log operation:', error)
  }
}