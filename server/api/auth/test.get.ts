import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
    
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Key exists:', !!supabaseKey)
    
    const supabase = createClient(supabaseUrl as string, supabaseKey as string)
    
    // Test if we can reach Supabase
    const { data, error } = await supabase.auth.getSession()
    
    return {
      success: true,
      message: 'Supabase connection test',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      session: data?.session ? 'Session exists' : 'No session',
      error: error?.message || null
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})