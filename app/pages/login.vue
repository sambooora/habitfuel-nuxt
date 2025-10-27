<script setup lang="ts">
const { $supabase } = useNuxtApp()
const email = ref<string>('')
const password = ref<string>('')

const login = async (): Promise<void> => {
  const { error } = await $supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  if (error) alert(error.message)
  else navigateTo('/dashboard')
}
</script>
<template>
  <div class="max-w-sm mx-auto mt-20 p-6 border rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">Login</h1>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" class="border p-2 w-full mb-2 rounded" />
      <input v-model="password" type="password" placeholder="Password" class="border p-2 w-full mb-4 rounded" />
      <button class="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700">Login</button>
    </form>
    <p class="text-sm mt-3 text-center">
      Belum punya akun?
      <NuxtLink to="/signup" class="text-blue-600 underline">Sign up</NuxtLink>
    </p>
  </div>
</template>
