export default defineNuxtConfig({
  srcDir: 'app',

  modules: [
    '@nuxtjs/color-mode',
    'motion-v/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/tailwindcss',
  ],

  css: ['~~/assets/css/tailwind.css'],
  compatibilityDate: '2025-10-17',

  imports: {
    imports: [{
      from: 'tailwind-variants',
      name: 'tv',
    }],
  },

  colorMode: {
    storageKey: 'nuxt-uithing-boilerplate-color-mode',
    classSuffix: '',
  },

  icon: {
    clientBundle: { scan: true, sizeLimitKb: 0 },
    mode: 'svg',
    class: 'shrink-0',
    fetchTimeout: 2000,
    serverBundle: 'local',
  },
  tailwindcss: {
    // explicit empty config to satisfy TS
  },
})
