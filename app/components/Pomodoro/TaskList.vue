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

// Tambahan: rename task dengan prompt sederhana
function rename(t: { id: string; title: string }) {
  const next = window.prompt('Judul baru', t.title)
  if (next == null) return
  const res = tasksApi.updateTaskTitle(t.id, next)
  // Tampilkan pesan hasil
  window.alert(res.message)
}

const safeTasks = computed(() => tasksApi.tasks.value.filter(Boolean))
</script>

<template>
  <div class="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 md:p-6">
    <h2 class="text-lg md:text-xl font-semibold mb-4">Daftar Tugas</h2>

    <form @submit.prevent="add" class="flex gap-2 mb-4">
      <input v-model="newTitle" placeholder="Tugas baru..." class="border p-2 flex-1 rounded dark:bg-gray-800 dark:border-gray-700" />
      <UiButton class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Tambah</UiButton>
    </form>

    <ul class="space-y-2">
      <li
        v-for="t in safeTasks"
        :key="t.id"
        class="flex flex-col gap-2 rounded border p-2 dark:border-gray-700"
      >
      <div class="flex flex-row justify-between item-center w-full">
          <div>
            <UiButton
                :class="t.id === tasksApi.activeTaskId.value ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'"
                @click="tasksApi.setActive(t.id)"
              >
    {{ t.id === tasksApi.activeTaskId.value ? 'Aktif' : 'Pilih' }}
              </UiButton>
          </div>
  
          <div class="flex items-center gap-2">
            <UiButton
              :class="t.done ? 'bg-gray-200 dark:bg-gray-700' : 'bg-violet-600 text-white hover:bg-violet-700'"
              @click="tasksApi.toggleDone(t.id)"
            >
              {{ t.done ? 'Selesai ✓' : 'Tandai Selesai' }}
            </UiButton>
            <!-- Tambahan: tombol ubah judul -->
            <UiButton class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600" @click="rename(t)">Ubah Judul</UiButton>
            <UiButton class="bg-red-500 text-white hover:bg-red-600" @click="tasksApi.removeTask(t.id)">Hapus</UiButton>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div>
            <p class="font-medium">{{ t.title }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400">Sesi fokus: {{ t.focusSessions }}</p>
          </div>
        </div>
        
      </li>
    </ul>
  </div>
</template>