import { requireAuthUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)
    
    // Get the authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    return {
      success: true,
      data: { 
        user,
        token: token ? 'Present' : 'Missing',
        message: 'Authentication successful',
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Not authenticated',
      data: null
    }
  }
})