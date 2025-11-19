<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="!isDataLoaded" class="flex items-center justify-center h-64">
        <div class="text-center">
          <ClientOnly>
            <Icon name="ph:spinner" class="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
          </ClientOnly>
          <p class="text-gray-600 dark:text-gray-400">Loading finance data...</p>
        </div>
      </div>
      
      <!-- Main Content -->
      <div v-else>
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Finance Dashboard
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Manage your financial transactions, investments, debts, and assets
          </p>
        </div>

      <!-- Financial Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UiCard class="bg-white dark:bg-gray-800">
          <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <UiCardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Income
            </UiCardTitle>
            <ClientOnly>
              <Icon name="ph:trend-up" class="h-4 w-4 text-green-500" />
            </ClientOnly>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ formatCurrency(getTotalIncome) }}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              +12% from last month
            </p>
          </UiCardContent>
        </UiCard>

        <UiCard class="bg-white dark:bg-gray-800">
          <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <UiCardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Expenses
            </UiCardTitle>
            <ClientOnly>
              <Icon name="ph:trend-down" class="h-4 w-4 text-red-500" />
            </ClientOnly>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              {{ formatCurrency(getTotalExpenses) }}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              -5% from last month
            </p>
          </UiCardContent>
        </UiCard>

        <UiCard class="bg-white dark:bg-gray-800">
          <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <UiCardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Cash Flow
            </UiCardTitle>
            <ClientOnly>
              <Icon name="ph:cash" class="h-4 w-4 text-blue-500" />
            </ClientOnly>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-2xl font-bold" :class="getCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ formatCurrency(getCashFlow) }}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ getCashFlow >= 0 ? 'Positive' : 'Negative' }} cash flow
            </p>
          </UiCardContent>
        </UiCard>

        <UiCard class="bg-white dark:bg-gray-800">
          <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <UiCardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Net Worth
            </UiCardTitle>
            <ClientOnly>
              <Icon name="ph:chart-line" class="h-4 w-4 text-purple-500" />
            </ClientOnly>
          </UiCardHeader>
          <UiCardContent>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatCurrency(getNetWorth) }}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total assets - liabilities
            </p>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Tabs Navigation -->
      <div class="mb-6">
        <UiButtonGroup class="w-full md:w-auto" v-if="tabs.length > 0" :key="tabsKey">
          <UiButton
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :variant="activeTab === tab.id ? 'default' : 'ghost'"
            class="flex-1 md:flex-none"
          >
            <ClientOnly v-if="tab.icon">
              <Icon :name="tab.icon" class="h-4 w-4 mr-2" :key="tab.icon" />
            </ClientOnly>
            {{ tab.label }}
            <span v-if="tab.count !== null && tab.count !== undefined" class="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {{ tab.count }}
            </span>
          </UiButton>
        </UiButtonGroup>
      </div>

      <!-- Tab Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm" :key="activeTab">
        <!-- Transactions Tab -->
        <div v-show="activeTab === 'transactions'" class="p-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Transactions
            </h2>
            <UiButton @click="showTransactionModal = true">
              <ClientOnly>
                <Icon name="ph:plus" class="h-4 w-4 mr-2" />
              </ClientOnly>
              Add Transaction
            </UiButton>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div class="flex gap-2">
                <div class="flex w-full items-center justify-center">
                  <UiDatepicker v-model="dateRange.start"  @update:model-value="updateDateFilter">
                    <template #default="{ togglePopover }">
                      <UiButton
                        variant="outline"
                        :class="[!dateRange.start && 'text-muted-foreground', 'w-[260px] justify-start text-left']"
                        @click="togglePopover"
                      >
                        <Icon name="lucide:calendar" class="size-4" />
                        {{ dateRange.start ? formatDate(dateRange.start) : "Select a date" }}
                      </UiButton>
                    </template>
                  </UiDatepicker>
                </div>
                <div class="flex w-full items-center justify-center">
                  <UiDatepicker v-model="dateRange.end"  @update:model-value="updateDateFilter">
                      <template #default="{ togglePopover }">
                        <UiButton
                          variant="outline"
                          :class="[!dateRange.end && 'text-muted-foreground', 'w-[260px] justify-start text-left']"
                          @click="togglePopover"
                        >
                          <Icon name="lucide:calendar" class="size-4" />
                          {{ dateRange.end ? formatDate(dateRange.end) : "Select a date" }}
                        </UiButton>
                      </template>
                    </UiDatepicker>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <UiSelect
                v-model="selectedTransactionTypes"
                :options="transactionTypeOptions"
                placeholder="Select types"
                @update:model-value="updateTypeFilter"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <UiVeeInput
                v-model="searchQuery"
                placeholder="Search transactions..."
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- Transactions Table -->
          <UiTanStackTable
            :data="state.transactions ? [...state.transactions] : []"
            :columns="transactionColumns"
            :loading="state.loading"
            :pagination="true"
          />
        </div>

        <!-- Investments Tab -->
        <div v-show="activeTab === 'investments'" class="p-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Investments
            </h2>
            <UiButton @click="showInvestmentModal = true">
              <ClientOnly>
                <Icon name="ph:plus" class="h-4 w-4 mr-2" />
              </ClientOnly>
              Add Investment
            </UiButton>
          </div>

          <!-- Investment Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Total Invested</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold text-blue-600">
                  {{ formatCurrency(totalInvested) }}
                </div>
              </UiCardContent>
            </UiCard>
            
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Current Value</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold text-green-600">
                  {{ formatCurrency(totalInvestmentValue) }}
                </div>
              </UiCardContent>
            </UiCard>
            
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Total Return</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold" :class="totalInvestmentReturn >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(totalInvestmentReturn) }}
                  <span class="text-sm ml-1">({{ investmentReturnPercentage }}%)</span>
                </div>
              </UiCardContent>
            </UiCard>
          </div>

          <!-- Investments Table -->
          <UiTanStackTable
            :data="state.investments ? [...state.investments] : []"
            :columns="investmentColumns"
            :loading="state.loading"
            :pagination="true"
          />
        </div>

        <!-- Debts Tab -->
        <div v-show="activeTab === 'debts'" class="p-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Debts
            </h2>
            <UiButton @click="showDebtModal = true">
              <ClientOnly>
                <Icon name="ph:plus" class="h-4 w-4 mr-2" />
              </ClientOnly>
              Add Debt
            </UiButton>
          </div>

          <!-- Debt Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Total Debt</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold text-red-600">
                  {{ formatCurrency(totalDebt) }}
                </div>
              </UiCardContent>
            </UiCard>
            
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Monthly Payments</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold text-blue-600">
                  {{ formatCurrency(totalMonthlyPayments) }}
                </div>
              </UiCardContent>
            </UiCard>
            
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Overdue Debts</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold text-orange-600">
                  {{ overdueDebtsCount }}
                </div>
              </UiCardContent>
            </UiCard>
          </div>

          <!-- Debts Table -->
          <UiTanStackTable
            :data="state.debts ? [...state.debts] : []"
            :columns="debtColumns"
            :loading="state.loading"
            :pagination="true"
          />
        </div>

        <!-- Assets Tab -->
        <div v-show="activeTab === 'assets'" class="p-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Assets
            </h2>
            <UiButton @click="showAssetModal = true">
              <ClientOnly>
                <Icon name="ph:plus" class="h-4 w-4 mr-2" />
              </ClientOnly>
              Add Asset
            </UiButton>
          </div>

          <!-- Asset Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Total Assets</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold text-green-600">
                  {{ formatCurrency(totalAssets) }}
                </div>
              </UiCardContent>
            </UiCard>
            
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Asset Count</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold text-blue-600">
                  {{ state.assets?.length || 0 }}
                </div>
              </UiCardContent>
            </UiCard>
            
            <UiCard>
              <UiCardHeader class="pb-2">
                <UiCardTitle class="text-sm font-medium">Avg. Appreciation</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-2xl font-bold" :class="averageAssetAppreciation >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ averageAssetAppreciation }}%
                </div>
              </UiCardContent>
            </UiCard>
          </div>

          <!-- Assets Table -->
          <UiTanStackTable
            :data="state.assets ? [...state.assets] : []"
            :columns="assetColumns"
            :loading="state.loading"
            :pagination="true"
          />
        </div>

        <!-- Charts Tab -->
        <div v-show="activeTab === 'charts'" class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Financial Analytics
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Cash Flow Chart -->
            <UiCard>
              <UiCardHeader>
                <UiCardTitle>Cash Flow Trend</UiCardTitle>
                <UiCardDescription>Monthly income vs expenses</UiCardDescription>
              </UiCardHeader>
              <UiCardContent>
                <ClientOnly>
                  <UiApexchart
                    type="line"
                    :options="cashFlowChartOptions as any"
                    :series="cashFlowSeries"
                    height="300"
                  />
                </ClientOnly>
              </UiCardContent>
            </UiCard>

            <!-- Asset Composition Chart -->
            <UiCard>
              <UiCardHeader>
                <UiCardTitle>Asset Composition</UiCardTitle>
                <UiCardDescription>Distribution of your assets</UiCardDescription>
              </UiCardHeader>
              <UiCardContent>
                <ClientOnly>
                  <UiApexchart
                    type="pie"
                    :options="assetCompositionChartOptions as any"
                    :series="assetCompositionSeries"
                    height="300"
                  />
                </ClientOnly>
              </UiCardContent>
            </UiCard>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <UiConfirmDialog
        :is-open="showConfirmDialog"
        :title="confirmDialogTitle"
        :description="confirmDialogDescription"
        :variant="confirmDialogVariant"
        confirm-text="Delete"
        cancel-text="Cancel"
        @update:is-open="(value) => showConfirmDialog = value"
        @confirm="confirmDialogResolve?.(true)"
        @cancel="confirmDialogResolve?.(false)"
      />

      <!-- Modals -->
      <FinanceTransactionModal
        v-model="showTransactionModal"
        :categories="[...state.categories]"
        @success="handleTransactionSave"
      />
      
      <FinanceInvestmentModal
        v-model="showInvestmentModal"
        @success="handleInvestmentSave"
      />
      
      <FinanceDebtModal
        v-model="showDebtModal"
        @success="handleDebtSave"
      />
      
      <FinanceAssetModal
        v-model="showAssetModal"
        @success="handleAssetSave"
      />

      <!-- Update Modals -->
      <FinanceTransactionModal
        v-model="showUpdateTransactionModal"
        :categories="[...state.categories]"
        :editing-item="currentEditingTransaction"
        @success="handleUpdateTransactionSave"
      />
      
      <FinanceInvestmentModal
        v-model="showUpdateInvestmentModal"
        :editing-item="currentEditingInvestment"
        @success="handleUpdateInvestmentSave"
      />
      
      <FinanceDebtModal
        v-model="showUpdateDebtModal"
        :editing-item="currentEditingDebt"
        @success="handleUpdateDebtSave"
      />
      
      <FinanceAssetModal
        v-model="showUpdateAssetModal"
        :editing-item="currentEditingAsset"
        @success="handleUpdateAssetSave"
      />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'
import type { ColumnDef } from '@tanstack/vue-table'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'DEBT_PAYMENT' | 'ASSET_PURCHASE' | 'ASSET_SALE'
  amount: number | { toNumber: () => number }
  description?: string
  date: string
  category?: {
    id: string
    name: string
    color?: string
    icon?: string
  }
}

interface Investment {
  id: string
  name: string
  type: string
  totalInvested: number | { toNumber: () => number }
  currentValue?: number | { toNumber: () => number }
  purchaseDate: string
  isActive: boolean
}

interface Debt {
  id: string
  lenderName: string
  principalAmount: number | { toNumber: () => number }
  currentBalance: number | { toNumber: () => number }
  interestRate?: number | { toNumber: () => number }
  monthlyPayment?: number | { toNumber: () => number }
  status: 'ACTIVE' | 'PAID' | 'OVERDUE' | 'DEFAULTED'
  startDate: string
  dueDate?: string
}

interface Asset {
  id: string
  name: string
  type: string
  purchasePrice: number | { toNumber: () => number }
  currentValue?: number | { toNumber: () => number }
  status: 'ACTIVE' | 'SOLD' | 'DEPRECIATED' | 'DAMAGED' | 'LOST'
  purchaseDate: string
}

// Page meta
definePageMeta({
  layout: 'dashboard'
})

// Composables
const { $toast } = useNuxtApp()
const { state, fetchTransactions, fetchInvestments, fetchDebts, fetchAssets, getTotalIncome, getTotalExpenses, getNetWorth, getCashFlow, setDateRange, setTransactionTypeFilter, setSearchQuery, createTransaction, createInvestment, createDebt, createAsset, deleteTransaction, deleteInvestment, deleteDebt, deleteAsset, initializeFinanceData, refreshTransactions, refreshInvestments, refreshDebts, refreshAssets } = useFinance()

// Reactive state
const activeTab = ref('transactions')
const showTransactionModal = ref(false)
const showInvestmentModal = ref(false)
const showDebtModal = ref(false)
const showAssetModal = ref(false)

// Update modal state
const showUpdateTransactionModal = ref(false)
const showUpdateInvestmentModal = ref(false)
const showUpdateDebtModal = ref(false)
const showUpdateAssetModal = ref(false)

// Current editing items
const currentEditingTransaction = ref<Transaction | null>(null)
const currentEditingInvestment = ref<Investment | null>(null)
const currentEditingDebt = ref<Debt | null>(null)
const currentEditingAsset = ref<Asset | null>(null)

const isDataLoaded = ref(false)
const userId = useState<string>('auth:userId')
const tabsKey = ref(0) // For forcing re-render of tabs

// Confirmation dialog state
const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogDescription = ref('')
const confirmDialogVariant = ref<'default' | 'destructive'>('default')
let confirmDialogResolve: ((confirmed: boolean) => void) | null = null

// Filter state
const dateRange = ref({ start: null, end: null })
const selectedTransactionTypes = ref<string[]>([])
const searchQuery = ref('')

// Confirmation function
const showConfirmation = (
  title: string,
  description: string,
  variant: 'default' | 'destructive' = 'default'
): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmDialogTitle.value = title
    confirmDialogDescription.value = description
    confirmDialogVariant.value = variant
    confirmDialogResolve = resolve
    showConfirmDialog.value = true
  })
}

// Tabs configuration
const tabs = computed(() => [
  {
    id: 'transactions',
    label: 'Transactions',
    icon: 'ph:arrows-left-right', // Keep this but add defensive check
    count: state.transactions.length
  },
  {
    id: 'investments',
    label: 'Investments',
    icon: 'ph:chart-line-up', // Changed to more standard icon
    count: state.investments.length
  },
  {
    id: 'debts',
    label: 'Debts',
    icon: 'ph:credit-card', // Keep this but add defensive check
    count: state.debts.length
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: 'ph:house-simple', // Changed to more standard icon
    count: state.assets.length
  },
  {
    id: 'charts',
    label: 'Analytics',
    icon: 'ph:chart-bar',
    count: null
  }
])

// Transaction type options
const transactionTypeOptions = [
  { label: 'Income', value: 'INCOME' },
  { label: 'Expense', value: 'EXPENSE' },
  { label: 'Investment', value: 'INVESTMENT' },
  { label: 'Debt Payment', value: 'DEBT_PAYMENT' },
  { label: 'Asset Purchase', value: 'ASSET_PURCHASE' },
  { label: 'Asset Sale', value: 'ASSET_SALE' }
]

// Investment calculations
const totalInvested = computed(() => {
  return state.investments.reduce((sum, inv) => sum + getAmountValue(inv.totalInvested), 0)
})

const totalInvestmentValue = computed(() => {
  return state.investments.reduce((sum, inv) => {
    const currentValue = inv.currentValue ? getAmountValue(inv.currentValue) : getAmountValue(inv.totalInvested)
    return sum + currentValue
  }, 0)
})

const totalInvestmentReturn = computed(() => {
  return totalInvestmentValue.value - totalInvested.value
})

const investmentReturnPercentage = computed(() => {
  return totalInvested.value > 0 ? ((totalInvestmentReturn.value / totalInvested.value) * 100).toFixed(1) : '0.0'
})

// Debt calculations
const totalDebt = computed(() => {
  return state.debts.reduce((sum, debt) => sum + getAmountValue(debt.currentBalance), 0)
})

const totalMonthlyPayments = computed(() => {
  return state.debts.reduce((sum, debt) => sum + getAmountValue(debt.monthlyPayment), 0)
})

const overdueDebtsCount = computed(() => {
  return state.debts.filter(debt => debt.status === 'OVERDUE').length
})

// Asset calculations
const totalAssets = computed(() => {
  return state.assets.reduce((sum, asset) => {
    const purchasePriceValue = getAmountValue(asset.purchasePrice)
    const currentValue = asset.currentValue ? getAmountValue(asset.currentValue) : purchasePriceValue
    return sum + currentValue
  }, 0)
})

const averageAssetAppreciation = computed(() => {
  if (state.assets.length === 0) return 0
  const appreciations = state.assets.map(asset => {
    const purchasePriceValue = getAmountValue(asset.purchasePrice)
    const currentValue = asset.currentValue ? getAmountValue(asset.currentValue) : purchasePriceValue
    return ((currentValue - purchasePriceValue) / purchasePriceValue) * 100
  })
  return Number((appreciations.reduce((sum, val) => sum + val, 0) / state.assets.length).toFixed(1))
})

// Chart data
const cashFlowSeries = computed(() => [
  {
    name: 'Income',
    data: [4500, 5200, 4800, 5500, 6200, 5800, 6500, 7000, 6800, 7200, 7500, 8000]
  },
  {
    name: 'Expenses',
    data: [3200, 3500, 3300, 3800, 4200, 3900, 4100, 4500, 4300, 4600, 4800, 5000]
  }
])

const cashFlowChartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 300,
    toolbar: { show: false }
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  colors: ['#10b981', '#ef4444'],
  legend: {
    position: 'top'
  }
}))

const assetCompositionSeries = computed((): number[] => {
  const composition = state.assets.reduce((acc, asset) => {
    const type = asset.type
    const currentValue = asset.currentValue ? getAmountValue(asset.currentValue) : getAmountValue(asset.purchasePrice)
    acc[type] = (acc[type] || 0) + currentValue
    return acc
  }, {} as Record<string, number>)
  
  return Object.values(composition)
})

const assetCompositionChartOptions = computed(() => ({
  chart: {
    type: 'pie' as const,
    height: 300
  },
  labels: Object.keys(state.assets.reduce((acc, asset) => {
    const type = asset.type
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)),
  legend: {
    position: 'bottom'
  }
}))

// Table columns
const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('date') as string)
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const color = type === 'INCOME' ? 'green' : type === 'EXPENSE' ? 'red' : 'blue'
      return h('span', { 
        class: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-${color}-500 text-${color}-600` 
      }, type)
    }
  },
  {
    accessorKey: 'description',
    header: 'Description'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('amount')
      const type = row.getValue('type') as string
      const color = type === 'INCOME' ? 'text-green-600' : 'text-red-600'
      const amountValue = getAmountValue(amount as number | { toNumber: () => number } | undefined)
      return h('div', { class: `font-medium ${color}` }, formatCurrency(amountValue))
    }
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as { name: string; color?: string; icon?: string } | undefined
      if (!category || !category.name) return 'N/A'
      return h('div', { class: 'flex items-center gap-2' }, [
        category.icon ? h('span', category.icon) : null,
        h('span', category.name)
      ])
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const transaction = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('button', {
          class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0',
          onClick: () => handleEditTransaction(transaction)
        }, [
          '✏️'
        ]),
        h('button', {
          class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 text-red-600 hover:text-red-700',
          onClick: () => handleDeleteTransaction(transaction)
        }, [
          '🗑️'
        ])
      ])
    }
  },
 
]

const assetColumns: ColumnDef<Asset>[] = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'purchasePrice',
    header: 'Purchase Price',
    cell: ({ row }) => {
      const purchasePrice = row.getValue('purchasePrice')
      const amountValue = getAmountValue(purchasePrice as number | { toNumber: () => number } | undefined)
      return formatCurrency(amountValue)
    }
  },
  {
    accessorKey: 'currentValue',
    header: 'Current Value',
    cell: ({ row }) => {
      const currentValue = row.getValue('currentValue')
      const amountValue = getAmountValue(currentValue as number | { toNumber: () => number } | undefined)
      return formatCurrency(amountValue)
    }
  },
  {
    accessorKey: 'purchaseDate',
    header: 'Purchase Date',
    cell: ({ row }) => formatDate(row.getValue('purchaseDate') as string)
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const asset = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('button', {
          class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0',
          onClick: () => handleEditAsset(asset)
        }, [
          '✏️'
        ]),
        h('button', {
          class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 text-red-600 hover:text-red-700',
          onClick: () => handleDeleteAsset(asset)
        }, [
          '🗑️'
        ])
      ])
    }
  }
]

const investmentColumns: ColumnDef<Investment>[] = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'totalInvested',
    header: 'Total Invested',
    cell: ({ row }) => {
      const totalInvested = row.getValue('totalInvested')
      const amountValue = getAmountValue(totalInvested as number | { toNumber: () => number } | undefined)
      return formatCurrency(amountValue)
    }
  },
  {
    accessorKey: 'currentValue',
    header: 'Current Value',
    cell: ({ row }) => {
      const currentValue = row.getValue('currentValue')
      const amountValue = getAmountValue(currentValue as number | { toNumber: () => number } | undefined)
      return formatCurrency(amountValue)
    }
  },
  {
    accessorKey: 'purchaseDate',
    header: 'Purchase Date',
    cell: ({ row }) => formatDate(row.getValue('purchaseDate') as string)
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return h('span', { 
        class: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
          isActive ? 'border-green-500 text-green-600' : 'border-gray-500 text-gray-600'
        }` 
      }, isActive ? 'Active' : 'Inactive')
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const investment = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('button', {
          class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0',
          onClick: () => handleEditInvestment(investment)
        }, [
          '✏️'
        ]),
        h('button', {
          class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 text-red-600 hover:text-red-700',
          onClick: () => handleDeleteInvestment(investment)
        }, [
          '🗑️'
        ])
      ])
    }
  }
]

const debtColumns: ColumnDef<Debt>[] = [
  {
    accessorKey: 'lenderName',
    header: 'Lender'
  },
  {
    accessorKey: 'principalAmount',
    header: 'Principal Amount',
    cell: ({ row }) => {
      const principalAmount = row.getValue('principalAmount')
      const amountValue = getAmountValue(principalAmount as number | { toNumber: () => number } | undefined)
      return formatCurrency(amountValue)
    }
  },
  {
    accessorKey: 'currentBalance',
    header: 'Current Balance',
    cell: ({ row }) => {
      const currentBalance = row.getValue('currentBalance')
      const amountValue = getAmountValue(currentBalance as number | { toNumber: () => number } | undefined)
      return formatCurrency(amountValue)
    }
  },
  {
    accessorKey: 'interestRate',
    header: 'Interest Rate',
    cell: ({ row }) => {
      const interestRate = row.getValue('interestRate') as number | undefined
      return interestRate ? `${interestRate}%` : 'N/A'
    }
  },
  {
    accessorKey: 'monthlyPayment',
    header: 'Monthly Payment',
    cell: ({ row }) => {
      const monthlyPayment = row.getValue('monthlyPayment') as number | undefined
      return monthlyPayment ? formatCurrency(monthlyPayment) : 'N/A'
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const color = {
        'ACTIVE': 'border-green-500 text-green-600',
        'PAID': 'border-blue-500 text-blue-600',
        'OVERDUE': 'border-red-500 text-red-600',
        'DEFAULTED': 'border-gray-500 text-gray-600'
      }[status] || 'border-gray-500 text-gray-600'
      return h('span', { 
        class: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${color}` 
      }, status)
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => formatDate(row.getValue('startDate') as string)
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const debt = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('button', {
          class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0',
          onClick: () => handleEditDebt(debt)
        }, [
          '✏️'
        ]),
        h('button', {
          class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 text-red-600 hover:text-red-700',
          onClick: () => handleDeleteDebt(debt)
        }, [
          '🗑️'
        ])
      ])
    }
  }
]

// Helper function to handle amount conversion
const getAmountValue = (amount: number | { toNumber: () => number } | undefined): number => {
  if (amount === undefined || amount === null) return 0
  if (typeof amount === 'object' && 'toNumber' in amount) {
    return amount.toNumber()
  }
  return Number(amount)
}

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return 'N/A'
  try {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  } catch (error) {
    return 'Invalid Date'
  }
}

const updateDateFilter = () => {
  setDateRange(dateRange.value.start, dateRange.value.end)
}

const updateTypeFilter = () => {
  setTransactionTypeFilter(selectedTransactionTypes.value)
}

const debouncedSearch = debounce(() => {
  setSearchQuery(searchQuery.value)
}, 300)

const handleTransactionSave = async (data: any) => {
  // Modal already handled the API call, just refresh data
  await fetchTransactions()
}

const handleInvestmentSave = async (data: any) => {
  // Modal already handled the API call, just refresh data
  await fetchInvestments()
}

const handleDebtSave = async (data: any) => {
  // Modal already handled the API call, just refresh data
  await fetchDebts()
}

const handleAssetSave = async (data: any) => {
  // Modal already handled the API call, just refresh data
  await fetchAssets()
}

// Update save handlers - simplified since modals handle API calls
const handleUpdateTransactionSave = async (data: any) => {
  // Modal already handled the API call, just refresh data and reset state
  currentEditingTransaction.value = null
  await fetchTransactions()
}

const handleUpdateInvestmentSave = async (data: any) => {
  // Modal already handled the API call, just refresh data and reset state
  currentEditingInvestment.value = null
  await fetchInvestments()
}

const handleUpdateDebtSave = async (data: any) => {
  // Modal already handled the API call, just refresh data and reset state
  currentEditingDebt.value = null
  await fetchDebts()
}

const handleUpdateAssetSave = async (data: any) => {
  // Modal already handled the API call, just refresh data and reset state
  currentEditingAsset.value = null
  await fetchAssets()
}

// Edit and Delete handlers
const handleEditTransaction = (transaction: Transaction) => {
  currentEditingTransaction.value = transaction
  showUpdateTransactionModal.value = true
}

const handleDeleteTransaction = async (transaction: Transaction) => {
  console.log('Delete transaction clicked:', transaction.id)
  try {
    const confirmed = await showConfirmation(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.description}"? This action cannot be undone.`,
      'destructive'
    )
    console.log('Confirmation result:', confirmed)
    if (confirmed) {
      await deleteTransaction(transaction.id, true)
      $toast.success('Transaction deleted successfully')
    }
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    $toast.error('Failed to delete transaction')
  }
}

const handleEditInvestment = (investment: Investment) => {
  currentEditingInvestment.value = investment
  showUpdateInvestmentModal.value = true
}

const handleDeleteInvestment = async (investment: Investment) => {
  console.log('Delete investment clicked:', investment.id)
  try {
    const confirmed = await showConfirmation(
      'Delete Investment',
      `Are you sure you want to delete "${investment.name}"? This action cannot be undone.`,
      'destructive'
    )
    console.log('Investment confirmation result:', confirmed)
    if (confirmed) {
      await deleteInvestment(investment.id, true)
      $toast.success('Investment deleted successfully')
    }
  } catch (error) {
    console.error('Failed to delete investment:', error)
    $toast.error('Failed to delete investment')
  }
}

const handleEditDebt = (debt: Debt) => {
  currentEditingDebt.value = debt
  showUpdateDebtModal.value = true
}

const handleDeleteDebt = async (debt: Debt) => {
  console.log('Delete debt clicked:', debt.id)
  try {
    const confirmed = await showConfirmation(
      'Delete Debt',
      `Are you sure you want to delete debt from "${debt.lenderName}"? This action cannot be undone.`,
      'destructive'
    )
    console.log('Debt confirmation result:', confirmed)
    if (confirmed) {
      await deleteDebt(debt.id, true)
      $toast.success('Debt deleted successfully')
    }
  } catch (error) {
    console.error('Failed to delete debt:', error)
    $toast.error('Failed to delete debt')
  }
}

const handleEditAsset = (asset: Asset) => {
  currentEditingAsset.value = asset
  showUpdateAssetModal.value = true
}

const handleDeleteAsset = async (asset: Asset) => {
  console.log('Delete asset clicked:', asset.id)
  try {
    const confirmed = await showConfirmation(
      'Delete Asset',
      `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`,
      'destructive'
    )
    console.log('Asset confirmation result:', confirmed)
    if (confirmed) {
      await deleteAsset(asset.id, true)
      $toast.success('Asset deleted successfully')
    }
  } catch (error) {
    console.error('Failed to delete asset:', error)
    $toast.error('Failed to delete asset')
  }
}


// Lifecycle
onMounted(async () => {
  try {
    await initializeFinanceData()
    isDataLoaded.value = true
    tabsKey.value++ // Force re-render of tabs after data loads
  } catch (error) {
    console.error('Failed to initialize finance data:', error)
    isDataLoaded.value = true // Still set to true to allow rendering
    tabsKey.value++ // Force re-render even on error
  }
})
</script>