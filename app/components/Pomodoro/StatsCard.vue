<script setup lang="ts">
import { computed } from 'vue'
import { usePomodoro } from '~/composables/usePomodoro'
import { useTasks } from '~/composables/useTasks'

const pomodoro = usePomodoro()
const tasks = useTasks()
const totalFocused = computed(() => formatHM(pomodoro.elapsedWorkSeconds.value))

function formatHM(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return h > 0 ? `${h}j ${m}m` : `${m}m`
}
</script>

<template>
  <div class="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 md:p-6">
    <h2 class="text-lg md:text-xl font-semibold mb-4">Statistik</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-3 rounded bg-gray-100 dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total Waktu Fokus</p>
        <p class="text-xl font-semibold">{{ totalFocused }}</p>
      </div>
      <div class="p-3 rounded bg-gray-100 dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Sesi Fokus Selesai</p>
        <p class="text-xl font-semibold">{{ pomodoro.workSessionsCompleted }}</p>
      </div>
      <div class="p-3 rounded bg-gray-100 dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Tugas Selesai</p>
        <p class="text-xl font-semibold">{{ tasks.completedTasksCount }}</p>
      </div>
    </div>
  </div>
</template>