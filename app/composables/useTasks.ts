/**
 * useTasks - Composable untuk manajemen tugas terkait Pomodoro.
 * - Tambah/hapus tugas, set aktif, tandai selesai.
 * - Statistik: jumlah tugas selesai, total sesi fokus.
 * - Persist: localStorage.
 */

import { computed, watch } from 'vue'

export type PomodoroTask = {
  id: string
  title: string
  focusSessions: number
  done: boolean
}

const STORAGE_KEY = 'hf:tasks'

export function useTasks() {
  const tasks = useState<PomodoroTask[]>('pomodoro:tasks', () => [])
  const activeTaskId = useState<string | null>('pomodoro:activeTaskId', () => null)

  const activeTask = computed(() => tasks.value.find(t => t.id === activeTaskId.value) || null)
  const completedTasksCount = computed(() => tasks.value.filter(t => t.done).length)
  const totalFocusSessions = computed(() => tasks.value.reduce((acc, t) => acc + t.focusSessions, 0))

  function addTask(title: string) {
    const id = crypto?.randomUUID?.() ? crypto.randomUUID() : String(Date.now())
    tasks.value.push({ id, title: title.trim(), focusSessions: 0, done: false })
    if (!activeTaskId.value) activeTaskId.value = id
  }

  function removeTask(id: string) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx >= 0) tasks.value.splice(idx, 1)
    if (activeTaskId.value === id) {
      activeTaskId.value = tasks.value.length ? tasks.value[0]!.id : null
    }
  }

  function setActive(id: string) {
    activeTaskId.value = id
  }

  function toggleDone(id: string) {
    const t = tasks.value.find(t => t.id === id)
    if (t) t.done = !t.done
  }

  function incrementActiveTaskFocus() {
    const t = tasks.value.find(t => t.id === activeTaskId.value)
    if (t) t.focusSessions += 1
  }

  // Persist ke localStorage
  if (process.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        tasks.value = Array.isArray(data.tasks) ? data.tasks : tasks.value
        activeTaskId.value = data.activeTaskId ?? activeTaskId.value
      } catch { /* ignore */ }
    }

    watch([tasks, activeTaskId], () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks: tasks.value,
        activeTaskId: activeTaskId.value
      }))
    }, { deep: true })
  }

  return {
    tasks,
    activeTaskId,
    activeTask,
    completedTasksCount,
    totalFocusSessions,
    addTask,
    removeTask,
    setActive,
    toggleDone,
    incrementActiveTaskFocus,
  }
}