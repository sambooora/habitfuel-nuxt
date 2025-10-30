<script setup lang="ts">
// ... existing code ...
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 dark:text-gray-100">
    <DashboardHeader />
    <main class="container mx-auto py-6">
      <slot />
    </main>
  </div>
</template>