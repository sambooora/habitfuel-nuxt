import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.FINANCE_ENCRYPTION_KEY || process.env.NUXT_ENCRYPTION_KEY || 'your-default-encryption-key-32-bytes-long'
const IV_LENGTH = 16 // For AES, this is always 16

/**
 * Encrypt sensitive financial data
 */
export function encryptFinancialData(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt financial data')
  }
}

/**
 * Decrypt sensitive financial data
 */
export function decryptFinancialData(encryptedText: string): string {
  try {
    const textParts = encryptedText.split(':')
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format')
    }
    
    const iv = Buffer.from(textParts[0], 'hex')
    const encrypted = textParts[1]
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt financial data')
  }
}

/**
 * Hash sensitive data (one-way encryption for things like account numbers)
 */
export function hashFinancialData(data: string): string {
  try {
    return crypto.createHash('sha256').update(data + ENCRYPTION_KEY).digest('hex')
  } catch (error) {
    console.error('Hashing error:', error)
    throw new Error('Failed to hash financial data')
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Sanitize financial data for logging (remove sensitive information)
 */
export function sanitizeFinancialData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const sanitized = { ...data }
  const sensitiveFields = [
    'cardNumber', 'accountNumber', 'routingNumber', 'ssn', 'taxId',
    'bankAccount', 'creditCard', 'password', 'pin', 'cvv'
  ]
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

/**
 * Encrypt string data (for task titles, etc.)
 */
export function encryptString(text: string): string {
  try {
    return encryptFinancialData(text)
  } catch (error) {
    console.error('String encryption error:', error)
    throw new Error('Failed to encrypt string data')
  }
}

/**
 * Decrypt string data (for task titles, etc.)
 */
export function decryptString(encryptedText: string): string {
  try {
    return decryptFinancialData(encryptedText)
  } catch (error) {
    console.error('String decryption error:', error)
    throw new Error('Failed to decrypt string data')
  }
}