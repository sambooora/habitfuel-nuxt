<script setup lang="ts">
// ... existing code ...
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 dark:text-gray-100">
    <Header />
    <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>
  </div>
</template>