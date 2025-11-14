<script setup lang="ts">
const { $supabase } = useNuxtApp()
const email = ref('richiesambora9029@gmail.com')
const password = ref('Slash929')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const testLogin = async () => {
  isLoading.value = true
  error.value = ''
  success.value = ''
  
  try {
    console.log('Testing login with:', email.value)
    
    if (!$supabase) {
      error.value = 'Supabase client not available'
      console.error('Supabase client is undefined')
      return
    }
    
    const { data, error: authError } = await ($supabase as any).auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    
    if (authError) {
      error.value = authError.message
      console.error('Login error:', authError)
    } else if (data?.user) {
      success.value = 'Login successful!'
      console.log('Login successful:', data.user)
      console.log('Session:', data.session)
      
      // Set user ID in state
      useState('auth:userId', () => data.user.id)
      
      // Test the session
      const { data: sessionData, error: sessionError } = await ($supabase as any).auth.getSession()
      console.log('Current session:', sessionData.session)
      
      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 1000)
    } else {
      error.value = 'No user data returned'
      console.error('No user data:', data)
    }
  } catch (e) {
    error.value = e.message || 'Unknown error occurred'
    console.error('Exception:', e)
  } finally {
    isLoading.value = false
  }
}

const testSupabaseConnection = () => {
  const { $supabase } = useNuxtApp()
  console.log('Supabase client:', $supabase)
  console.log('Supabase available:', !!$supabase)
}
</script>

<template>
  <div class="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">Test Login</h1>
    
    <div class="mb-4">
      <button @click="testSupabaseConnection" class="bg-blue-500 text-white px-4 py-2 rounded">
        Test Supabase Connection
      </button>
    </div>
    
    <form @submit.prevent="testLogin">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Email:</label>
        <input 
          v-model="email" 
          type="email" 
          class="border p-2 w-full rounded"
          placeholder="richiesambora9029@gmail.com"
        />
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Password:</label>
        <input 
          v-model="password" 
          type="password" 
          class="border p-2 w-full rounded"
          placeholder="Slash929"
        />
      </div>
      
      <button 
        type="submit" 
        :disabled="isLoading"
        class="bg-green-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {{ isLoading ? 'Testing...' : 'Test Login' }}
      </button>
    </form>
    
    <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded">
      Error: {{ error }}
    </div>
    
    <div v-if="success" class="mt-4 p-3 bg-green-100 text-green-700 rounded">
      Success: {{ success }}
    </div>
  </div>
</template>