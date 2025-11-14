import { createHash } from 'crypto'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
}

/**
 * Rate limiting for financial operations
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix = 'finance' } = options
  
  return async (event: any, userId: string) => {
    const key = `${keyPrefix}:${userId}:${getCurrentWindow(windowMs)}`
    
    // Clean up old entries
    cleanupExpiredEntries()
    
    const current = rateLimitStore.get(key) || { count: 0, resetTime: Date.now() + windowMs }
    
    if (current.count >= maxRequests) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.',
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': current.resetTime.toString()
        }
      })
    }
    
    // Increment counter
    current.count++
    rateLimitStore.set(key, current)
    
    // Add rate limit headers to response
    setHeader(event, 'X-RateLimit-Limit', maxRequests.toString())
    setHeader(event, 'X-RateLimit-Remaining', (maxRequests - current.count).toString())
    setHeader(event, 'X-RateLimit-Reset', current.resetTime.toString())
  }
}

/**
 * Get current time window
 */
function getCurrentWindow(windowMs: number): number {
  return Math.floor(Date.now() / windowMs)
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Rate limiter for sensitive financial operations
 */
export const financialOperationRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  keyPrefix: 'finance_ops'
})

/**
 * Rate limiter for data export operations
 */
export const exportRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  keyPrefix: 'export'
})

/**
 * Rate limiter for transaction creation
 */
export const transactionRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20,
  keyPrefix: 'transaction'
})

/**
 * Rate limiter for dashboard data access
 */
export const dashboardRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  keyPrefix: 'dashboard'
})