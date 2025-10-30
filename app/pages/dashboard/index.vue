<script setup lang="ts">
import StatsCard from '~/components/Pomodoro/StatsCard.vue'
definePageMeta({
  layout: 'dashboard',
  title: 'Home',
})
const { $supabase } = useNuxtApp()
  const displayName = ref<string>('')

  onMounted(async () => {
    const { data, error } = await ($supabase as any).auth.getSession()
    if (error) {
      displayName.value = 'Guest'
      return
    }
    const user = data?.session?.user
    displayName.value =
      ((user?.user_metadata as any)?.name ??
       (user?.user_metadata as any)?.username ??
       (user?.user_metadata as any)?.full_name ??
       user?.email ??
       'Guest')
  })
</script>

<template>
  <div class="p-4 md:p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Welcome Back, {{ displayName }} </h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-1">
        <StatsCard />
      </div>
    </div>
  </div>
</template>