<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 dark:text-gray-100">
    <DashboardSidebar />
    <main class="transition-all duration-300 ease-in-out" :class="{ 'lg:ml-64': !isCollapsed, 'lg:ml-16': isCollapsed }">
      <div class="container mx-auto py-6 px-4 lg:px-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isCollapsed = ref(false)

const updateSidebarState = () => {
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  isCollapsed.value = savedCollapsed === 'true'
}

onMounted(() => {
  updateSidebarState()
  window.addEventListener('storage', updateSidebarState)
})

onUnmounted(() => {
  window.removeEventListener('storage', updateSidebarState)
})
</script>