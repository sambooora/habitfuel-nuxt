export default defineNuxtRouteMiddleware(async (to: any) => {
  if (import.meta.server) return
  const { $supabase } = useNuxtApp()
  if (!$supabase) return
  const { data } = await $supabase.auth.getSession()

  if (to.path.startsWith('/dashboard') && !data?.session) {
    return navigateTo('/login')
  }

  if ((to.path === '/login' || to.path === '/signup') && data?.session) {
    return navigateTo('/dashboard')
  }
})
