<script setup lang="ts">
import { computed } from 'vue'
import { usePomodoro } from '~/composables/usePomodoro'

const pomodoro = usePomodoro()
const radius = 80
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() => circumference * (1 - pomodoro.progress.value))

function modeLabel(m: 'work' | 'short' | 'long') {
  if (m === 'work') return 'Fokus'
  if (m === 'short') return 'Istirahat Pendek'
  return 'Istirahat Panjang'
}
function modeBadgeClass(m: 'work' | 'short' | 'long') {
  if (m === 'work') return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
  if (m === 'short') return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
  return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
}
</script>

<template>
  <div class="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 md:p-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg md:text-xl font-semibold">Pomodoro Timer</h2>
      <span
        class="inline-flex items-center gap-2 text-xs md:text-sm px-2 py-1 rounded-full"
        :class="modeBadgeClass(pomodoro.mode.value)"
      >
        <Icon name="ph:clock" class="size-4" />
{{ modeLabel(pomodoro.mode.value) }}
      </span>
    </div>

    <div class="mt-4 md:mt-6 flex flex-col items-center">
      <!-- Progress Circle -->
      <svg :width="200" :height="200" class="block">
        <circle :r="radius" cx="100" cy="100" class="text-gray-200 dark:text-gray-700" :stroke-width="12" fill="transparent" :stroke-dasharray="circumference" stroke="currentColor" />
        <circle :r="radius" cx="100" cy="100" class="text-green-500" :stroke-width="12" fill="transparent"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
                stroke-linecap="round"
                stroke="currentColor"
                transform="rotate(-90 100 100)" />
        <text x="100" y="110" text-anchor="middle" class="fill-current text-3xl font-mono">
          {{ pomodoro.formattedTime }}
        </text>
      </svg>

      <!-- Controls -->
      <div class="mt-6 flex flex-wrap gap-3">
        <button @click="pomodoro.start" class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Start</button>
        <button @click="pomodoro.pause" class="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600">Pause</button>
        <button @click="pomodoro.reset()" class="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">Reset</button>
      </div>

      <!-- Durasi ringkas -->
      <div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs md:text-sm">
        <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">
          Kerja: {{ Math.round(Number(pomodoro.workDuration.value) / 60) }} m
        </div>
        <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">
          Istirahat: {{ Math.round(Number(pomodoro.shortBreakDuration.value) / 60) }} m
        </div>
        <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">
          Panjang: {{ Math.round(Number(pomodoro.longBreakDuration.value) / 60) }} m
        </div>
      </div>

      <!-- Info Siklus -->
      <p class="mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
        Sesi kerja selesai: {{ pomodoro.workSessionsCompleted }} • Siklus saat ini: {{ Number(pomodoro.cycle) % 4 }}/4
      </p>
    </div>
  </div>
</template>