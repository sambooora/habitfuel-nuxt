<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'User Management',
})

import type { User } from '@prisma/client'
const { $supabase } = useNuxtApp()

const users = ref<User[]>([])
const name = ref<string>('')
const email = ref<string>('')

const fetchUsers = async (): Promise<void> => {
  users.value = await $fetch<User[]>('/api/users')
}

onMounted(fetchUsers)

const addUser = async (): Promise<void> => {
  if (!email.value) return
  await $fetch<User>('/api/users', {
    method: 'POST',
    body: { 
      name: name.value, 
      email: email.value 
    }
  })
  name.value = ''
  email.value = ''
  fetchUsers()
}

const deleteUser = async (id: string): Promise<void> => {
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  fetchUsers()
}
</script>
<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">User Dashboard</h1>
    </div>

    <form @submit.prevent="addUser" class="flex gap-2 mb-4">
      <input v-model="name" placeholder="Name" class="border p-2 flex-1 rounded" />
      <input v-model="email" placeholder="Email" class="border p-2 flex-1 rounded" />
      <button class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">Add</button>
    </form>

    <ul>
      <li v-for="user in users" :key="user.id" class="border-b py-2 flex justify-between">
        <div>
          <p class="font-medium">{{ user.name || '-' }}</p>
          <p class="text-sm text-gray-600">{{ user.email }}</p>
        </div>
        <button @click="deleteUser(user.id)" class="text-red-500 hover:underline">Delete</button>
      </li>
    </ul>
  </div>
</template>


