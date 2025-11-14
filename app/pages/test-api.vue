<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">API Security Testing Dashboard</h1>
      
      <!-- Authentication Status -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Authentication Status</h2>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">User Status:</span>
            <span :class="user ? 'text-green-600' : 'text-red-600'">
              {{ user ? 'Authenticated' : 'Not Authenticated' }}
            </span>
          </div>
          <div v-if="user" class="flex justify-between">
            <span class="text-gray-600">Email:</span>
            <span class="text-gray-900">{{ user.email }}</span>
          </div>
        </div>
      </div>

      <!-- Test Results Summary -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Test Results Summary</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ passedTests }}</div>
            <div class="text-sm text-gray-600">Passed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ failedTests }}</div>
            <div class="text-sm text-gray-600">Failed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ totalTests }}</div>
            <div class="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      <!-- Individual API Tests -->
      <div class="space-y-4">
        <div v-for="test in apiTests" :key="test.name" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">{{ test.name }}</h3>
            <button
              @click="runTest(test)"
              :disabled="test.loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ test.loading ? 'Testing...' : 'Run Test' }}
            </button>
          </div>
          
          <div class="text-sm text-gray-600 mb-2">
            <strong>Method:</strong> {{ test.method }} | <strong>Endpoint:</strong> {{ test.endpoint }}
          </div>
          
          <div v-if="test.status" class="mt-4 p-3 rounded-md" :class="test.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
            <strong>Status:</strong> {{ test.status.toUpperCase() }}
            <div v-if="test.response" class="mt-2 text-xs">
              <strong>Response:</strong> {{ JSON.stringify(test.response, null, 2) }}
            </div>
            <div v-if="test.error" class="mt-2 text-xs">
              <strong>Error:</strong> {{ test.error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk Testing -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Bulk Testing</h2>
        <button
          @click="runAllTests"
          :disabled="runningAllTests"
          class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ runningAllTests ? 'Running All Tests...' : 'Run All Tests' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface TestResult {
  name: string
  method: string
  endpoint: string
  loading: boolean
  status?: 'success' | 'error'
  response?: any
  error?: string
}

const user = ref<any>(null)
const runningAllTests = ref(false)

const apiTests = ref<TestResult[]>([
  {
    name: 'Dashboard Data',
    method: 'GET',
    endpoint: '/api/finance/dashboard',
    loading: false
  },
  {
    name: 'Get Transactions',
    method: 'GET',
    endpoint: '/api/finance/transactions',
    loading: false
  },
  {
    name: 'Create Transaction',
    method: 'POST',
    endpoint: '/api/finance/transactions',
    loading: false
  },
  {
    name: 'Get Investments',
    method: 'GET',
    endpoint: '/api/finance/investments',
    loading: false
  },
  {
    name: 'Create Investment',
    method: 'POST',
    endpoint: '/api/finance/investments',
    loading: false
  },
  {
    name: 'Get Debts',
    method: 'GET',
    endpoint: '/api/finance/debts',
    loading: false
  },
  {
    name: 'Create Debt',
    method: 'POST',
    endpoint: '/api/finance/debts',
    loading: false
  },
  {
    name: 'Get Assets',
    method: 'GET',
    endpoint: '/api/finance/assets',
    loading: false
  },
  {
    name: 'Create Asset',
    method: 'POST',
    endpoint: '/api/finance/assets',
    loading: false
  }
])

const passedTests = computed(() => apiTests.value.filter(test => test.status === 'success').length)
const failedTests = computed(() => apiTests.value.filter(test => test.status === 'error').length)
const totalTests = computed(() => apiTests.value.filter(test => test.status).length)

const checkAuth = async () => {
  try {
    const { data } = await $fetch('/api/auth/me')
    user.value = data.user
  } catch (error) {
    console.error('Auth check failed:', error)
    user.value = null
  }
}

const runTest = async (test: TestResult) => {
  test.loading = true
  test.status = undefined
  test.response = undefined
  test.error = undefined

  try {
    let response: any
    
    switch (test.method) {
      case 'GET':
        response = await $fetch(test.endpoint)
        break
      case 'POST':
        const testData = getTestData(test.name)
        response = await $fetch(test.endpoint, {
          method: 'POST',
          body: testData
        })
        break
    }
    
    test.status = 'success'
    test.response = response
  } catch (error: any) {
    test.status = 'error'
    test.error = error.message || 'Unknown error'
    test.response = error.data || null
  } finally {
    test.loading = false
  }
}

const getTestData = (testName: string) => {
  const now = new Date()
  
  switch (testName) {
    case 'Create Transaction':
      return {
        type: 'income',
        category: 'salary',
        amount: 5000,
        description: 'Test salary transaction',
        date: now.toISOString()
      }
    case 'Create Investment':
      return {
        name: 'Test Stock',
        symbol: 'TEST',
        shares: 10,
        purchasePrice: 100,
        currentPrice: 105,
        purchaseDate: now.toISOString()
      }
    case 'Create Debt':
      return {
        name: 'Test Loan',
        amount: 10000,
        interestRate: 5.5,
        monthlyPayment: 200,
        remainingBalance: 9500,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    case 'Create Asset':
      return {
        name: 'Test Asset',
        type: 'property',
        value: 250000,
        purchaseDate: now.toISOString(),
        description: 'Test property asset'
      }
    default:
      return {}
  }
}

const runAllTests = async () => {
  runningAllTests.value = true
  
  for (const test of apiTests.value) {
    await runTest(test)
    // Add small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  runningAllTests.value = false
}

onMounted(() => {
  checkAuth()
})
</script>