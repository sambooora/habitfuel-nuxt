import type { SupabaseClient, Session } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to: any) => {
  if (import.meta.server) return

  const nuxtApp = useNuxtApp()
  const supabase = nuxtApp.$supabase as SupabaseClient | undefined
  if (!supabase) return

  // Helper: redirect aman, cegah loop dan pastikan path valid
  const safeNavigate = (path: string, opts: Parameters<typeof navigateTo>[1] = {}) => {
    if (!path || typeof path !== 'string') return
    if (!path.startsWith('/')) return
    if (to.path === path) return
    // Hindari loop jika source == target
    return navigateTo({ path }, { replace: true, ...opts })
  }

  const isProtected = to.path.startsWith('/dashboard')
  const isAuthRoute = to.path === '/login' || to.path === '/signup'
  const isRoot = to.path === '/'

  let session: Session | null = null
  let sessionError: unknown = null

  // Ambil session dengan penanganan error
  try {
    const { data, error } = await supabase.auth.getSession()
    sessionError = error ?? null
    session = (data?.session ?? null) as Session | null
  } catch (err) {
    sessionError = err
    session = null
  }

  // Validasi session: ada user dan belum expired
  const isSessionValid =
    !!(session && session.user && session.expires_at && session.expires_at * 1000 > Date.now())
  const hasCorruptSession = !!(session && !isSessionValid)

  // Cegah redirect loop jika Nuxt mendeteksi redirectFrom == current
  if (to.redirectedFrom && to.redirectedFrom.fullPath === to.fullPath) {
    return abortNavigation()
  }

  // Skenario root ('/'): jika login redirect ke /dashboard/index, jika tidak lanjutkan
  if (isRoot) {
    if (isSessionValid) {
      return safeNavigate('/dashboard')
    }
    return
  }

  // Skenario protected: akses dashboard butuh autentikasi
  if (isProtected) {
    if (!isSessionValid || sessionError || hasCorruptSession) {
      // Bersihkan sesi korup jika memungkinkan, lalu arahkan ke login
      try {
        if (session) await supabase.auth.signOut()
      } catch {
        // abaikan error signOut
      }
      return navigateTo(
        { path: '/login', query: { redirectTo: to.fullPath } },
        { replace: true }
      )
    }
    return
  }

  // Skenario halaman auth: jika sudah login, jauhkan ke dashboard/index
  if (isAuthRoute && isSessionValid) {
    return safeNavigate('/dashboard')
  }
})
