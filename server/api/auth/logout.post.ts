export default defineEventHandler(async (event) => {
  try {
    // Get the authorization header to validate the user is authenticated
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '')
    
    if (token) {
      // Only attempt Supabase logout if token is provided
      try {
        // Get Supabase configuration
        const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl as string, supabaseKey as string)
        
        // Sign out the user from Supabase
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.error('Supabase logout error:', error)
          // Continue with the response even if there's an error
        }
      } catch (supabaseError) {
        console.error('Supabase client error during logout:', supabaseError)
        // Continue with logout even if Supabase fails
      }
    }

    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error: any) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: error.message || 'Failed to logout'
    }
  }
})