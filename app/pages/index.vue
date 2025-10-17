<script setup lang="ts">

definePageMeta({
  title: 'Home',
  layout: 'default',
})

const posts = [
  {
    id: 1,
    title: 'Task Management Cerdas',
    excerpt: 'Buat, atur, dan urutkan task dengan prioritas dan deadline.',
    image: '/favicon.ico',
    author: { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/80?img=1' },
    date: 'Oct 17, 2025',
    read: '6 min',
  },
  {
    id: 2,
    title: 'Pomodoro Terintegrasi',
    excerpt: 'Tetap fokus dengan sesi 25 menit dan jeda otomatis.',
    image: '/favicon.ico',
    author: { name: 'John Smith', avatar: 'https://i.pravatar.cc/80?img=2' },
    date: 'Oct 10, 2025',
    read: '4 min',
  },
  {
    id: 3,
    title: 'Statistik Produktivitas',
    excerpt: 'Lihat progres, waktu fokus, dan task yang diselesaikan untuk motivasi diri.',
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
    <Header />

    <!-- Hero -->
    <section class="py-20 md:py-28">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="mx-auto max-w-3xl">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Bangun Fokus, Kelola Waktu, dan Capai Target dengan HabitFuel.
          </h1>
          <p class="mt-4 text-gray-600 dark:text-gray-400 md:text-lg">
            Aplikasi produktivitas yang menggabungkan task management, Pomodoro timer, dan statistik kinerja untuk bantu kamu jadi versi terbaik setiap har
          </p>
          <div class="mt-8 flex justify-center gap-4">
            <UiButton size="lg" variant="green">Mulai Gratis</UiButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Grid Konten -->
    <section class="py-12">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Fitur Utama</h2>
        </div>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <UiCard
            v-for="post in posts"
            :key="post.id"
            class="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div class="p-6">
              <h3 class="text-xl font-semibold">{{ post.title }}</h3>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ post.excerpt }}
              </p>
            </div>
          </UiCard>
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
          <UiButton size="lg" variant="outline">Sign Up Now</UiButton>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <Footer />
  </div>
</template>