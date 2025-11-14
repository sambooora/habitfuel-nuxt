import type { PrismaClient } from '@prisma/client'

export interface FinanceState {
  transactions: any[]
  investments: any[]
  debts: any[]
  assets: any[]
  categories: any[]
  loading: boolean
  error: string | null
  filters: {
    dateRange: {
      start: Date | null
      end: Date | null
    }
    transactionType: string[]
    category: string[]
    searchQuery: string
  }
}

export interface CreateTransactionData {
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'DEBT_PAYMENT' | 'ASSET_PURCHASE' | 'ASSET_SALE'
  amount: number
  description?: string
  date: Date
  categoryId?: string
  isRecurring?: boolean
  recurrenceInterval?: string
  recurrenceEndDate?: Date
  tags?: string[]
}

export interface CreateInvestmentData {
  type: 'STOCK' | 'BOND' | 'MUTUAL_FUND' | 'ETF' | 'REAL_ESTATE' | 'CRYPTO' | 'COMMODITY' | 'OTHER'
  name: string
  symbol?: string
  quantity?: number
  purchasePrice: number
  currentPrice?: number
  totalInvested: number
  currentValue?: number
  purchaseDate: Date
  broker?: string
  notes?: string
  tags?: string[]
}

export interface CreateDebtData {
  lenderName: string
  principalAmount: number
  interestRate?: number
  currentBalance: number
  monthlyPayment?: number
  startDate: Date
  dueDate?: Date
  nextPaymentDate?: Date
  collateral?: string
  notes?: string
  tags?: string[]
}

export interface CreateAssetData {
  type: 'REAL_ESTATE' | 'VEHICLE' | 'INVESTMENT' | 'CASH' | 'BANK_ACCOUNT' | 'DIGITAL_ASSET' | 'PRECIOUS_METAL' | 'OTHER'
  name: string
  description?: string
  purchasePrice: number
  currentValue?: number
  purchaseDate: Date
  depreciationRate?: number
  location?: string
  serialNumber?: string
  warrantyExpiry?: Date
  insuranceInfo?: string
  notes?: string
  tags?: string[]
}

export const useFinance = () => {
  const { $toast } = useNuxtApp()

  const state = reactive<FinanceState>({
    transactions: [],
    investments: [],
    debts: [],
    assets: [],
    categories: [],
    loading: false,
    error: null,
    filters: {
      dateRange: {
        start: null,
        end: null
      },
      transactionType: [],
      category: [],
      searchQuery: ''
    }
  })

  const userId = useState<string>('auth:userId')

  // Helper function to get auth headers
  const getAuthHeaders = async () => {
    const { $supabase } = useNuxtApp()
    const { data: { session } } = await ($supabase as any).auth.getSession()

    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    return {
      'Authorization': `Bearer ${session.access_token}`
    }
  }

  // Transaction operations
  const fetchTransactions = async () => {
    if (!userId.value) return

    state.loading = true
    state.error = null

    try {
      // Build query parameters
      const params: any = {}

      if (state.filters.dateRange.start && state.filters.dateRange.end) {
        params.startDate = state.filters.dateRange.start.toISOString()
        params.endDate = state.filters.dateRange.end.toISOString()
      }

      if (state.filters.transactionType.length > 0) {
        params.type = state.filters.transactionType[0] // API expects single type
      }

      if (state.filters.category.length > 0) {
        params.category = state.filters.category[0] // API expects single category
      }

      if (state.filters.searchQuery) {
        params.search = state.filters.searchQuery
      }

      // Fetch from secure API
      const response = await $fetch('/api/finance/transactions', {
        method: 'GET',
        query: params,
        headers: await getAuthHeaders()
      })

      // Enrich transactions with category information
      console.log('Enriching transactions with categories:', state.categories)
      console.log('Raw transactions from API:', response.transactions)
      console.log('Number of transactions:', response.transactions?.length)
      console.log('Number of categories:', state.categories?.length)

      const enrichedTransactions = response.transactions.map((transaction: any, index: number) => {
        console.log(`Processing transaction ${index}:`, transaction)

        // Handle case where API returns categoryId but no category object
        if (transaction.categoryId && !transaction.category) {
          const category = state.categories.find(cat => cat.id === transaction.categoryId)
          console.log(`Looking for category ${transaction.categoryId}:`, category)
          if (category) {
            console.log(`Found category for transaction ${index}:`, category.name)
            return {
              ...transaction,
              category: category
            }
          } else {
            console.log(`Category not found for ID ${transaction.categoryId}`)
          }
        }

        // Handle case where API returns category as a string (ID only)
        if (typeof transaction.category === 'string' && transaction.category) {
          const category = state.categories.find(cat => cat.id === transaction.category)
          console.log(`Looking for category string ${transaction.category}:`, category)
          if (category) {
            console.log(`Found category for transaction ${index}:`, category.name)
            return {
              ...transaction,
              category: category
            }
          } else {
            console.log(`Category not found for string ID ${transaction.category}`)
          }
        }

        // Handle case where API returns category object with only ID
        if (transaction.category && typeof transaction.category === 'object' && transaction.category.id && !transaction.category.name) {
          const category = state.categories.find(cat => cat.id === transaction.category.id)
          console.log(`Looking for category object ID ${transaction.category.id}:`, category)
          if (category) {
            console.log(`Found category for transaction ${index}:`, category.name)
            return {
              ...transaction,
              category: category
            }
          } else {
            console.log(`Category not found for object ID ${transaction.category.id}`)
          }
        }

        // If transaction already has a category with name, keep it
        if (transaction.category && typeof transaction.category === 'object' && transaction.category.name) {
          console.log(`Transaction ${index} already has category with name:`, transaction.category.name)
        }

        return transaction
      })

      console.log('Enriched transactions:', enrichedTransactions)
      console.log('Sample enriched transaction:', enrichedTransactions[0])

      // Check how many transactions have categories with names
      const transactionsWithCategoryNames = enrichedTransactions.filter((t: any) => t.category && t.category.name)
      console.log(`Transactions with category names: ${transactionsWithCategoryNames.length}/${enrichedTransactions.length}`)

      state.transactions = enrichedTransactions
    } catch (error) {
      state.error = 'Failed to fetch transactions'
      console.error('Error fetching transactions:', error)
      $toast.error('Failed to fetch transactions. Please try again.')
    } finally {
      state.loading = false
    }
  }

  const createTransaction = async (data: CreateTransactionData) => {
    if (!userId.value) throw new Error('User not authenticated')

    state.loading = true
    state.error = null

    try {
      // Ensure date is properly formatted
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        recurrenceEndDate: data.recurrenceEndDate ?
          (data.recurrenceEndDate instanceof Date ? data.recurrenceEndDate.toISOString() : data.recurrenceEndDate) :
          undefined
      }

      console.log('Creating transaction with data:', formattedData)

      const transaction = await $fetch('/api/finance/transactions', {
        method: 'POST',
        body: formattedData,
        headers: await getAuthHeaders()
      })

      state.transactions.unshift(transaction)
      $toast.success('Transaction created successfully')
      return transaction
    } catch (error) {
      state.error = 'Failed to create transaction'
      console.error('Error creating transaction:', error)
      $toast.error('Failed to create transaction. Please try again.')
      throw error
    } finally {
      state.loading = false
    }
  }

  // Investment operations
  const fetchInvestments = async () => {
    if (!userId.value) return

    state.loading = true
    state.error = null

    try {
      const response = await $fetch('/api/finance/investments', {
        method: 'GET',
        query: { isActive: true },
        headers: await getAuthHeaders()
      })

      state.investments = response.investments
    } catch (error) {
      state.error = 'Failed to fetch investments'
      console.error('Error fetching investments:', error)
      $toast.error('Failed to fetch investments. Please try again.')
    } finally {
      state.loading = false
    }
  }

  const createInvestment = async (data: CreateInvestmentData) => {
    if (!userId.value) throw new Error('User not authenticated')

    state.loading = true
    state.error = null

    try {
      const investment = await $fetch('/api/finance/investments', {
        method: 'POST',
        body: {
          ...data,
          purchaseDate: data.purchaseDate.toISOString()
        },
        headers: await getAuthHeaders()
      })

      state.investments.unshift(investment)
      $toast.success('Investment created successfully')
      return investment
    } catch (error) {
      state.error = 'Failed to create investment'
      console.error('Error creating investment:', error)
      $toast.error('Failed to create investment. Please try again.')
      throw error
    } finally {
      state.loading = false
    }
  }

  // Debt operations
  const fetchDebts = async () => {
    if (!userId.value) return

    state.loading = true
    state.error = null

    try {
      const response = await $fetch('/api/finance/debts', {
        method: 'GET',
        headers: await getAuthHeaders()
      })

      state.debts = response.debts
    } catch (error) {
      state.error = 'Failed to fetch debts'
      console.error('Error fetching debts:', error)
      $toast.error('Failed to fetch debts. Please try again.')
    } finally {
      state.loading = false
    }
  }

  const createDebt = async (data: CreateDebtData) => {
    if (!userId.value) throw new Error('User not authenticated')

    state.loading = true
    state.error = null

    try {
      const debt = await $fetch('/api/finance/debts', {
        method: 'POST',
        body: {
          ...data,
          startDate: data.startDate.toISOString(),
          dueDate: data.dueDate?.toISOString(),
          nextPaymentDate: data.nextPaymentDate?.toISOString()
        },
        headers: await getAuthHeaders()
      })

      state.debts.unshift(debt)
      $toast.success('Debt created successfully')
      return debt
    } catch (error) {
      state.error = 'Failed to create debt'
      console.error('Error creating debt:', error)
      $toast.error('Failed to create debt. Please try again.')
      throw error
    } finally {
      state.loading = false
    }
  }

  // Asset operations
  const fetchAssets = async () => {
    if (!userId.value) return

    state.loading = true
    state.error = null

    try {
      const response = await $fetch('/api/finance/assets', {
        method: 'GET',
        query: { status: 'ACTIVE' },
        headers: await getAuthHeaders()
      })

      state.assets = response.assets
    } catch (error) {
      state.error = 'Failed to fetch assets'
      console.error('Error fetching assets:', error)
      $toast.error('Failed to fetch assets. Please try again.')
    } finally {
      state.loading = false
    }
  }

  const createAsset = async (data: CreateAssetData) => {
    if (!userId.value) throw new Error('User not authenticated')

    state.loading = true
    state.error = null

    try {
      const asset = await $fetch('/api/finance/assets', {
        method: 'POST',
        body: {
          ...data,
          purchaseDate: data.purchaseDate.toISOString(),
          warrantyExpiry: data.warrantyExpiry?.toISOString()
        },
        headers: await getAuthHeaders()
      })

      state.assets.unshift(asset)
      $toast.success('Asset created successfully')
      return asset
    } catch (error) {
      state.error = 'Failed to create asset'
      console.error('Error creating asset:', error)
      $toast.error('Failed to create asset. Please try again.')
      throw error
    } finally {
      state.loading = false
    }
  }

  // Category operations
  const fetchCategories = async () => {
    if (!userId.value) {
      console.warn('No user ID available, cannot fetch categories')
      return
    }

    state.loading = true
    state.error = null

    try {
      console.log('Fetching categories from API for user:', userId.value)
      const response = await $fetch('/api/finance/categories', {
        method: 'GET',
        headers: await getAuthHeaders()
      })

      console.log('Categories fetched:', response.categories)
      state.categories = response.categories

      if (!response.categories || response.categories.length === 0) {
        console.warn('No categories found, using default categories')
        // Add some default categories if none exist
        state.categories = [
          { id: '1', name: 'Salary', color: '#10b981', icon: '💰', type: 'INCOME' },
          { id: '2', name: 'Food & Dining', color: '#f59e0b', icon: '🍽️', type: 'EXPENSE' },
          { id: '3', name: 'Transportation', color: '#3b82f6', icon: '🚗', type: 'EXPENSE' },
          { id: '4', name: 'Utilities', color: '#8b5cf6', icon: '💡', type: 'EXPENSE' },
          { id: '5', name: 'Entertainment', color: '#ec4899', icon: '🎬', type: 'EXPENSE' },
          { id: '6', name: 'Healthcare', color: '#ef4444', icon: '🏥', type: 'EXPENSE' },
          { id: '7', name: 'Shopping', color: '#6366f1', icon: '🛍️', type: 'EXPENSE' },
          { id: '8', name: 'Other', color: '#6b7280', icon: '📦', type: 'EXPENSE' }
        ]
      }
    } catch (error) {
      state.error = 'Failed to fetch categories'
      console.error('Error fetching categories:', error)
      $toast.error('Failed to fetch categories. Please try again.')

      // Fallback to default categories on error
      state.categories = [
        { id: '1', name: 'Salary', color: '#10b981', icon: '💰', type: 'INCOME' },
        { id: '2', name: 'Food & Dining', color: '#f59e0b', icon: '🍽️', type: 'EXPENSE' },
        { id: '3', name: 'Transportation', color: '#3b82f6', icon: '🚗', type: 'EXPENSE' },
        { id: '4', name: 'Utilities', color: '#8b5cf6', icon: '💡', type: 'EXPENSE' },
        { id: '5', name: 'Entertainment', color: '#ec4899', icon: '🎬', type: 'EXPENSE' },
        { id: '6', name: 'Healthcare', color: '#ef4444', icon: '🏥', type: 'EXPENSE' },
        { id: '7', name: 'Shopping', color: '#6366f1', icon: '🛍️', type: 'EXPENSE' },
        { id: '8', name: 'Other', color: '#6b7280', icon: '📦', type: 'EXPENSE' }
      ]
    } finally {
      state.loading = false
    }
  }

  // Financial calculations
  const getTotalIncome = computed(() => {
    return state.transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  })

  const getTotalExpenses = computed(() => {
    return state.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  })

  const getNetWorth = computed(() => {
    const totalAssets = state.assets.reduce((sum, asset) => {
      return sum + (parseFloat(asset.currentValue) || parseFloat(asset.purchasePrice))
    }, 0)

    const totalInvestments = state.investments.reduce((sum, investment) => {
      return sum + (parseFloat(investment.currentValue) || parseFloat(investment.totalInvested))
    }, 0)

    const totalDebts = state.debts.reduce((sum, debt) => {
      return sum + parseFloat(debt.currentBalance)
    }, 0)

    return totalAssets + totalInvestments - totalDebts
  })

  const getCashFlow = computed(() => {
    return getTotalIncome.value - getTotalExpenses.value
  })

  // Filter functions
  const setDateRange = (start: Date | null, end: Date | null) => {
    state.filters.dateRange.start = start
    state.filters.dateRange.end = end
    fetchTransactions()
  }

  const setTransactionTypeFilter = (types: string[]) => {
    state.filters.transactionType = types
    fetchTransactions()
  }

  const setCategoryFilter = (categories: string[]) => {
    state.filters.category = categories
    fetchTransactions()
  }

  const setSearchQuery = (query: string) => {
    state.filters.searchQuery = query
    fetchTransactions()
  }

  // Initialize data
  const initializeFinanceData = async () => {
    // Fetch categories first to ensure they're available for transaction enrichment
    await fetchCategories()

    // Then fetch all other data in parallel
    await Promise.all([
      fetchTransactions(),
      fetchInvestments(),
      fetchDebts(),
      fetchAssets()
    ])
  }

  return {
    state: readonly(state),

    // Transaction operations
    fetchTransactions,
    createTransaction,

    // Investment operations
    fetchInvestments,
    createInvestment,

    // Debt operations
    fetchDebts,
    createDebt,

    // Asset operations
    fetchAssets,
    createAsset,

    // Category operations
    fetchCategories,

    // Financial calculations
    getTotalIncome,
    getTotalExpenses,
    getNetWorth,
    getCashFlow,

    // Filter functions
    setDateRange,
    setTransactionTypeFilter,
    setCategoryFilter,
    setSearchQuery,

    // Initialization
    initializeFinanceData
  }
}