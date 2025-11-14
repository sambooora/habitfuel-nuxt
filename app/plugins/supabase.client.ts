import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
  if (!supabaseUrl || !supabaseKey) {
    console.error('[Supabase] Missing env: NUXT_PUBLIC_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_KEY')
    return { provide: { supabase: undefined } }
  }
  const supabase = createClient(supabaseUrl as string, supabaseKey as string)
  return { provide: { supabase } }
})