<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Pomodoro',
})

import PomodoroTimer from '~/components/Pomodoro/PomodoroTimer.vue'
import TaskList from '~/components/Pomodoro/TaskList.vue'
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
    <div class="flex items-center justify-start mb-4">
      <h1 class="text-2xl font-bold">Pomodoro</h1>
    </div>

    <div class="grid grid-col-1 lg:grid-cols-2 gap-4">
      <div>
        <PomodoroTimer />
      </div>  
      <div>
        <TaskList />
      </div>
    </div>
  </div>
</template>