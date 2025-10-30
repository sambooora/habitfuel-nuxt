<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'Sign Up',
})
const { $supabase } = useNuxtApp()
const email = ref<string>('')
const password = ref<string>('')

const signup = async (): Promise<void> => {
  if (!$supabase) throw new Error('Supabase client not available')
  const { error } = await ($supabase as any).auth.signUp({
    email: email.value,
    password: password.value
  })
  if (error) alert(error.message)
  else navigateTo('/dashboard')
}
</script>
<template>
  <div class="max-w-sm mx-auto mt-20 p-6 border rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">Sign Up</h1>
    <form @submit.prevent="signup">
      <input v-model="email" type="email" placeholder="Email" class="border p-2 w-full mb-2 rounded" />
      <input v-model="password" type="password" placeholder="Password" class="border p-2 w-full mb-4 rounded" />
      <button class="bg-green-600 text-white p-2 w-full rounded hover:bg-green-700">Sign Up</button>
    </form>
    <p class="text-sm mt-3 text-center">
      Sudah punya akun?
      <NuxtLink to="/login" class="text-blue-600 underline">Login</NuxtLink>
    </p>
  </div>
</template>
