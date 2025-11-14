<script setup lang="ts">
const { $supabase } = useNuxtApp()
const email = ref('richiesambora9029@gmail.com')
const password = ref('Slash929')
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const session = ref(null)

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
    
    console.log('Supabase client available:', !!$supabase)
    
    const { data, error: authError } = await ($supabase as any).auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    
    console.log('Login response:', { data, authError })
    
    if (authError) {
      error.value = authError.message
      console.error('Login error:', authError)
      console.error('Error details:', {
        message: authError.message,
        status: authError.status,
        name: authError.name
      })
    } else if (data?.user) {
      success.value = 'Login successful!'
      console.log('Login successful:', data.user)
      console.log('Session:', data.session)
      session.value = data.session
      
      // Set user ID in state
      useState('auth:userId', () => data.user.id)
      
      // Test the session
      const { data: sessionData, error: sessionError } = await ($supabase as any).auth.getSession()
      console.log('Current session after login:', sessionData.session)
      
      if (sessionError) {
        console.error('Session error:', sessionError)
      }
      
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
    console.error('Exception during login:', e)
    console.error('Stack trace:', e.stack)
  } finally {
    isLoading.value = false
  }
}

const checkCurrentSession = async () => {
  const { $supabase } = useNuxtApp()
  try {
    if (!$supabase) {
      console.error('Supabase client not available')
      return
    }
    
    const { data, error } = await ($supabase as any).auth.getSession()
    console.log('Current session:', data?.session)
    console.log('Session error:', error)
    if (data?.session) {
      session.value = data.session
      success.value = 'Session found!'
    } else {
      error.value = 'No active session'
    }
  } catch (e) {
    console.error('Error checking session:', e)
  }
}

const testSupabaseConnection = () => {
  const { $supabase } = useNuxtApp()
  console.log('Supabase client:', $supabase)
  console.log('Supabase available:', !!$supabase)
  if ($supabase) {
    console.log('Supabase auth:', $supabase.auth)
  }
}

// Check session on mount
onMounted(() => {
  checkCurrentSession()
})
</script>

<template>
  <div class="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow bg-gray-900 text-white">
    <h1 class="text-2xl font-bold mb-4">Test Login - Debug</h1>
    
    <div class="mb-4 space-y-2">
      <button @click="testSupabaseConnection" class="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Test Supabase Connection
      </button>
      <button @click="checkCurrentSession" class="bg-purple-500 text-white px-4 py-2 rounded w-full">
        Check Current Session
      </button>
    </div>
    
    <form @submit.prevent="testLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Email:</label>
        <input 
          v-model="email" 
          type="email" 
          class="border p-2 w-full rounded bg-gray-800 text-white"
          placeholder="richiesambora9029@gmail.com"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Password:</label>
        <input 
          v-model="password" 
          type="password" 
          class="border p-2 w-full rounded bg-gray-800 text-white"
          placeholder="Slash929"
        />
      </div>
      
      <button 
        type="submit" 
        :disabled="isLoading"
        class="bg-green-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {{ isLoading ? 'Testing Login...' : 'Test Login' }}
      </button>
    </form>
    
    <div v-if="error" class="mt-4 p-3 bg-red-900 text-red-200 rounded border border-red-700">
      <strong>Error:</strong> {{ error }}
    </div>
    
    <div v-if="success" class="mt-4 p-3 bg-green-900 text-green-200 rounded border border-green-700">
      <strong>Success:</strong> {{ success }}
    </div>
    
    <div v-if="session" class="mt-4 p-3 bg-blue-900 text-blue-200 rounded border border-blue-700">
      <strong>Session Active:</strong><br>
      User: {{ session.user.email }}<br>
      Token: {{ session.access_token.substring(0, 20) }}...
    </div>
    
    <div class="mt-6 text-sm text-gray-400">
      <p><strong>Debug Tips:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>Check browser console for detailed logs</li>
        <li>Verify Supabase client is loaded</li>
        <li>Test with the provided credentials</li>
        <li>Check network tab for API responses</li>
      </ul>
    </div>
  </div>
</template>