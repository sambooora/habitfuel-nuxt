import crypto from 'crypto'

const IV_LENGTH = 12
const TAG_LENGTH = 16

function getKey(): Buffer {
  const { private: { encryptionKey } } = useRuntimeConfig()
  if (!encryptionKey) {
    throw createError({ statusCode: 500, statusMessage: 'Missing NUXT_ENCRYPTION_KEY' })
  }
  return crypto.createHash('sha256').update(encryptionKey).digest()
}

export function encryptString(plain: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptString(payload: string): string {
  const buf = Buffer.from(payload, 'base64')
  const iv = buf.subarray(0, IV_LENGTH)
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const enc = buf.subarray(IV_LENGTH + TAG_LENGTH)
  const key = getKey()
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(enc), decipher.final()])
  return dec.toString('utf8')
}