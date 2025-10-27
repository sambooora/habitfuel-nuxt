<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasks } from '~/composables/useTasks'

const tasksApi = useTasks()
const newTitle = ref('')

function add() {
  const title = newTitle.value.trim()
  if (!title) return
  tasksApi.addTask(title)
  newTitle.value = ''
}

const safeTasks = computed(() => tasksApi.tasks.value.filter(Boolean))
</script>

<template>
  <div class="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 md:p-6">
    <h2 class="text-lg md:text-xl font-semibold mb-4">Daftar Tugas</h2>

    <form @submit.prevent="add" class="flex gap-2 mb-4">
      <input v-model="newTitle" placeholder="Tugas baru..." class="border p-2 flex-1 rounded dark:bg-gray-800 dark:border-gray-700" />
      <button class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Tambah</button>
    </form>

    <ul class="space-y-2">
      <li
        v-for="t in safeTasks"
        :key="t.id"
        class="flex items-center justify-between gap-2 rounded border p-2 dark:border-gray-700"
      >
        <div class="flex items-center gap-3">
          <button
            class="px-2 py-1 rounded text-xs"
            :class="t.id === tasksApi.activeTaskId.value ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'"
            @click="tasksApi.setActive(t.id)"
          >
{{ t.id === tasksApi.activeTaskId.value ? 'Aktif' : 'Pilih' }}
          </button>
          <div>
            <p class="font-medium">{{ t.title }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400">Sesi fokus: {{ t.focusSessions }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1 rounded text-xs"
            :class="t.done ? 'bg-gray-200 dark:bg-gray-700' : 'bg-violet-600 text-white hover:bg-violet-700'"
            @click="tasksApi.toggleDone(t.id)"
          >
            {{ t.done ? 'Selesai ✓' : 'Tandai Selesai' }}
          </button>
          <button class="px-3 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600" @click="tasksApi.removeTask(t.id)">Hapus</button>
        </div>
      </li>
    </ul>
  </div>
</template>