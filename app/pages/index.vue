<script setup lang="ts">
const navLinks = [
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Contact', href: '#' },
]

const posts = [
  {
    id: 1,
    title: 'Designing delightful UIs with Reka UI',
    excerpt: 'Build accessible, flexible components with Tailwind and Reka UI.',
    image: '/favicon.ico',
    author: { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/80?img=1' },
    date: 'Oct 17, 2025',
    read: '6 min',
  },
  {
    id: 2,
    title: 'Nuxt 4: tips for fast SSR',
    excerpt: 'How to keep your Nuxt app snappy with Vite.',
    image: '/favicon.ico',
    author: { name: 'John Smith', avatar: 'https://i.pravatar.cc/80?img=2' },
    date: 'Oct 10, 2025',
    read: '4 min',
  },
  {
    id: 3,
    title: 'Tailwind v4 in production',
    excerpt: 'Practical patterns to keep styles lean and scalable.',
    image: '/favicon.ico',
    author: { name: 'Alex Lee', avatar: 'https://i.pravatar.cc/80?img=3' },
    date: 'Sep 29, 2025',
    read: '5 min',
  },
]
</script>

<template>
  <div class="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <a href="#" class="flex items-center gap-2">
            <Icon name="ph:rocket-launch-duotone" class="size-6 shrink-0" />
            <span class="font-semibold">Acme Inc</span>
          </a>

          <nav class="hidden md:flex items-center gap-6">
            <a
              v-for="link in navLinks"
              :key="link.label"
              :href="link.href"
              class="text-sm font-medium hover:underline underline-offset-4"
            >
              {{ link.label }}
            </a>
          </nav>

          <div class="flex items-center gap-3">
            <UiButton variant="ghost" size="sm">Sign In</UiButton>
            <UiButton size="sm">Sign Up</UiButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="py-20 md:py-28">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="mx-auto max-w-3xl">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Clean, responsive blog-style landing
          </h1>
          <p class="mt-4 text-gray-600 dark:text-gray-400 md:text-lg">
            Build your next project with Nuxt, Tailwind v4, and UI Thing components.
          </p>
          <div class="mt-8 flex justify-center gap-4">
            <UiButton size="lg">Get Started</UiButton>
            <UiButton size="lg" variant="outline">Learn More</UiButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Grid Konten -->
    <section class="py-12">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="post in posts"
            :key="post.id"
            class="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <img :src="post.image" alt="" class="aspect-[4/3] w-full rounded-t-xl object-cover" />
            <div class="p-6">
              <h3 class="text-xl font-semibold">{{ post.title }}</h3>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ post.excerpt }}
              </p>

              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img
                    :src="post.author.avatar"
                    alt=""
                    class="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                  />
                  <div>
                    <p class="text-sm font-medium">{{ post.author.name }}</p>
                    <p class="text-xs text-gray-500">{{ post.date }} · {{ post.read }}</p>
                  </div>
                </div>

                <UiButton variant="ghost" size="sm">Read</UiButton>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 md:py-28">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Ready to get started?</h2>
        <p class="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-400">
          Sign up now and start building your next project in minutes.
        </p>
        <div class="mt-8">
          <UiButton size="lg">Sign Up Now</UiButton>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-gray-50 py-8 dark:border-gray-800 dark:bg-gray-900">
      <div
        class="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:flex-row items-center justify-between"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          © 2025 Acme Inc. All rights reserved.
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-sm hover:underline underline-offset-4">Terms</a>
          <a href="#" class="text-sm hover:underline underline-offset-4">Privacy</a>
        </div>
      </div>
    </footer>
  </div>
</template>