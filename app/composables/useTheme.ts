import { computed, onMounted } from 'vue'
import { themeLight, themeDark, applyThemeVars } from '~/utils/theme'

export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'hf:theme-preference'

export function useTheme() {
  // ... existing code ...
  const mode = useState<ThemeMode>('theme:mode', () => 'light')
  // Integrasi dengan @nuxtjs/color-mode bila tersedia
  const colorMode = (typeof useColorMode === 'function' ? useColorMode() : null) as any

  function apply(next: ThemeMode) {
    mode.value = next
    if (process.client) {
      localStorage.setItem(THEME_STORAGE_KEY, next)
      const root = document.documentElement

      // Terapkan class 'dark' agar Tailwind & komponen ikut berubah
      if (next === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')

      // Terapkan CSS variables dari konfigurasi theme
      applyThemeVars(root, next === 'dark' ? themeDark : themeLight)

      // Animasi transisi halus
      root.classList.add('theme-transition')
      window.setTimeout(() => root.classList.remove('theme-transition'), 300)
    }

    // Sinkronkan preferensi dengan color-mode (opsional)
    if (colorMode) {
      colorMode.preference = next
    }
  }

  function toggleTheme() {
    apply(mode.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    if (!process.client) return
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    const initial = saved === 'dark' ? 'dark' : 'light'
    apply(initial)
  })

  return {
    mode,
    isDark: computed(() => mode.value === 'dark'),
    setTheme: apply,
    toggleTheme,
  }
  // ... existing code ...
}