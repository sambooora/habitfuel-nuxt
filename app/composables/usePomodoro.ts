/**
 * usePomodoro - Composable untuk mengelola Pomodoro Timer.
 * - Durasi default: kerja 25m, istirahat pendek 5m, istirahat panjang 15m setelah 4 siklus.
 * - Kontrol: start, pause, reset.
 * - Event: memanggil callback saat sesi kerja selesai (integrasi dengan tasks).
 * - State management: menggunakan Nuxt useState agar bisa dishare antar komponen.
 * - Persist: localStorage untuk beberapa nilai (durasi, mode, cycle).
 */

import { onBeforeUnmount, watch, computed } from 'vue'

type Mode = 'work' | 'short' | 'long'

const STORAGE_KEY = 'hf:pomodoro'

export function usePomodoro() {
  // Durasi dalam detik
  const workDuration = useState<number>('pomodoro:workDuration', () => 25 * 60)
  const shortBreakDuration = useState<number>('pomodoro:shortBreakDuration', () => 5 * 60)
  const longBreakDuration = useState<number>('pomodoro:longBreakDuration', () => 15 * 60)

  // State utama
  const mode = useState<Mode>('pomodoro:mode', () => 'work')
  const isRunning = useState<boolean>('pomodoro:isRunning', () => false)
  const remaining = useState<number>('pomodoro:remaining', () => workDuration.value)
  const cycle = useState<number>('pomodoro:cycle', () => 0) // jumlah sesi kerja selesai (mod 4)
  const workSessionsCompleted = useState<number>('pomodoro:workSessionsCompleted', () => 0)
  const elapsedWorkSeconds = useState<number>('pomodoro:elapsedWorkSeconds', () => 0)

  // Callback saat sesi kerja selesai (opsional, untuk integrasi tasks)
  // Callback lokal (tidak diserialisasi SSR)
  let workSessionComplete: null | (() => void) = null

  // Interval id (hanya di client)
  let intervalId: ReturnType<typeof setInterval> | null = null

  const totalDuration = computed(() => {
    if (mode.value === 'work') return workDuration.value
    if (mode.value === 'short') return shortBreakDuration.value
    return longBreakDuration.value
  })

  const progress = computed(() => {
    const t = totalDuration.value
    if (t <= 0) return 0
    return (t - remaining.value) / t
  })

  const formattedTime = computed(() => formatMMSS(remaining.value))

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(tick, 1000)
  }

  function pause() {
    isRunning.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function reset(toMode: Mode = 'work') {
    pause()
    mode.value = toMode
    remaining.value = toMode === 'work'
      ? workDuration.value
      : toMode === 'short'
        ? shortBreakDuration.value
        : longBreakDuration.value
  }

  function nextModeAfterWork() {
    // Setelah 4 siklus kerja, istirahat panjang
    const next = (cycle.value + 1) % 4 === 0 ? 'long' : 'short'
    cycle.value += 1
    workSessionsCompleted.value += 1

    // Panggil callback bila diset
    if (typeof workSessionComplete === 'function') {
      workSessionComplete()
    }

    mode.value = next
    remaining.value = next === 'short' ? shortBreakDuration.value : longBreakDuration.value
  }

  function nextModeAfterBreak() {
    mode.value = 'work'
    remaining.value = workDuration.value
  }

  function tick() {
    if (!isRunning.value) return
    if (remaining.value > 0) {
      remaining.value -= 1
      if (mode.value === 'work') {
        elapsedWorkSeconds.value += 1
      }
      return
    }
    // Sesi selesai
    if (mode.value === 'work') {
      nextModeAfterWork()
    } else {
      nextModeAfterBreak()
    }
    // Auto-continue jika masih running
    if (!intervalId) {
      intervalId = setInterval(tick, 1000)
    }
  }

  function setDurations(d: { work?: number; short?: number; long?: number }) {
    if (typeof d.work === 'number') workDuration.value = d.work
    if (typeof d.short === 'number') shortBreakDuration.value = d.short
    if (typeof d.long === 'number') longBreakDuration.value = d.long
    // Sinkronkan remaining jika mode aktif berubah durasinya
    reset(mode.value)
  }

  // Pilihan durasi kerja (menit) yang diperbolehkan untuk dropdown
  const WORK_DURATION_CHOICES = [10, 15, 20, 25] as const

  /**
   * setWorkDurationChoice
   * Mengatur durasi kerja berdasarkan pilihan menit yang valid (10, 15, 20, 25).
   *
   * Parameter:
   * - minutes: number — durasi kerja dalam menit yang dipilih dari dropdown.
   *
   * Nilai return:
   * - { success: boolean; message: string }
   *   success: true jika durasi berhasil diterapkan, false jika gagal/invalid.
   *   message: pesan singkat terkait hasil validasi/aplikasi.
   *
   * Cara penggunaan:
   * - Panggil dari UI select: setWorkDurationChoice(selectedMinutes)
   * - Durasi akan dipersist lewat localStorage (via watch yang sudah ada).
   * - Timer akan di-reset ke mode 'work' agar durasi baru langsung diterapkan.
   */
  function setWorkDurationChoice(minutes: number): { success: boolean; message: string } {
    // Validasi tipe
    if (typeof minutes !== 'number' || Number.isNaN(minutes)) {
      return { success: false, message: 'Input durasi tidak valid.' }
    }
    // Validasi pilihan yang diperbolehkan
    if (!WORK_DURATION_CHOICES.includes(minutes as (typeof WORK_DURATION_CHOICES)[number])) {
      return { success: false, message: 'Pilihan durasi tidak diperbolehkan.' }
    }

    const nextSeconds = minutes * 60
    if (workDuration.value === nextSeconds) {
      // Tidak ada perubahan, tetap dianggap sukses agar UI tidak error
      return { success: true, message: 'Durasi kerja tidak berubah.' }
    }

    // Terapkan durasi dan reset timer ke mode kerja
    workDuration.value = nextSeconds
    reset('work') // pause + set remaining ke durasi kerja terbaru
    return { success: true, message: 'Durasi kerja berhasil diterapkan.' }
  }

  // Persist selected state ke localStorage
  if (process.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        workDuration.value = data.workDuration ?? workDuration.value
        shortBreakDuration.value = data.shortBreakDuration ?? shortBreakDuration.value
        longBreakDuration.value = data.longBreakDuration ?? longBreakDuration.value
        mode.value = data.mode ?? mode.value
        cycle.value = data.cycle ?? cycle.value
        remaining.value = data.remaining ?? remaining.value
        workSessionsCompleted.value = data.workSessionsCompleted ?? workSessionsCompleted.value
        elapsedWorkSeconds.value = data.elapsedWorkSeconds ?? elapsedWorkSeconds.value
      } catch { /* ignore */ }
    }

    watch(
      [workDuration, shortBreakDuration, longBreakDuration, mode, cycle, remaining, workSessionsCompleted, elapsedWorkSeconds],
      () => {
        const data = {
          workDuration: workDuration.value,
          shortBreakDuration: shortBreakDuration.value,
          longBreakDuration: longBreakDuration.value,
          mode: mode.value,
          cycle: cycle.value,
          remaining: remaining.value,
          workSessionsCompleted: workSessionsCompleted.value,
          elapsedWorkSeconds: elapsedWorkSeconds.value,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      },
      { deep: true }
    )
  }

  onBeforeUnmount(() => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  })

  return {
    // state
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    mode,
    isRunning,
    remaining,
    cycle,
    workSessionsCompleted,
    elapsedWorkSeconds,
    totalDuration,
    progress,
    formattedTime,
    // controls
    start,
    pause,
    reset,
    setDurations,
    // fungsi baru untuk pilihan durasi kerja
    setWorkDurationChoice,
    // ganti event hooks
    setOnWorkSessionComplete,
  }
}

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}


// Setter untuk callback sesi kerja selesai
function setOnWorkSessionComplete(fn: null | (() => void)) {
  let workSessionComplete: null | (() => void) = null

  // Setter untuk callback sesi kerja selesai
  function setOnWorkSessionComplete(fn: null | (() => void)) {
    workSessionComplete = fn
  }
}