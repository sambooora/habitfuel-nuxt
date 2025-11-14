import { requireAuthUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthUser(event)
    
    return {
      success: true,
      data: { user }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Not authenticated'
    }
  }
})