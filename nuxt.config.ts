export default defineNuxtConfig({
  srcDir: 'app',

  modules: [
    '@nuxtjs/color-mode',
    'motion-v/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/fonts',
    "@vee-validate/nuxt",
    '@nuxtjs/tailwindcss',
    "@yuta-inoue-ph/nuxt-vcalendar",
    "@vee-validate/nuxt",
    "vue-sonner/nuxt",
    "v-gsap-nuxt"

  ],

  css: ['~~/assets/css/tailwind.css'],
  compatibilityDate: '2025-10-17',

  imports: {
    imports: [{
      from: 'tailwind-variants',
      name: 'tv',
    }, {
      from: 'vue-sonner',
      name: 'toast',
      as: 'useSonner',
    }],
    // Auto-import tambahan untuk zod & vee-validate
    presets: [
      {
        from: 'zod',
        imports: ['z'],
      },
      {
        from: '@vee-validate/zod',
        imports: ['toTypedSchema'],
      },
      {
        from: 'vee-validate',
        imports: ['useIsSubmitting'],
      },
    ],

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

  app: {
    head: {
      script: [{
        src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js',
        defer: true,
      }, {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js',
        defer: true,
      }],
    },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    },
    private: {
      encryptionKey: process.env.NUXT_ENCRYPTION_KEY,
    },
  },
})