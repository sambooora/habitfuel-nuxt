<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Pomodoro',
})

import PomodoroTimer from '~/components/Pomodoro/PomodoroTimer.vue'
import TaskList from '~/components/Pomodoro/TaskList.vue'
import StatsCard from '~/components/Pomodoro/StatsCard.vue'
import { usePomodoro } from '~/composables/usePomodoro'
import { useTasks } from '~/composables/useTasks'

// Integrasi: saat sesi kerja selesai, tambah statistik pada task aktif
const pomodoro = usePomodoro()
const tasks = useTasks()

pomodoro.setOnWorkSessionComplete(() => {
  tasks.incrementActiveTaskFocus()
})
</script>

<template>
  <div class="p-4 md:p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Pomodoro</h1>
      <NuxtLink to="/dashboard" class="text-sm text-blue-600 hover:underline">Kembali ke Dashboard</NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2">
        <PomodoroTimer />
      </div>
      <div class="lg:col-span-1">
        <StatsCard />
      </div>
    </div>

    <div class="mt-4">
      <TaskList />
    </div>
  </div>
</template>