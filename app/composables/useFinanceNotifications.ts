export interface NotificationData {
  id?: string
  userId: string
  type: 'DEBT_DUE' | 'INVESTMENT_UPDATE' | 'BUDGET_ALERT' | 'TRANSACTION_REMINDER'
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: Date
  readAt?: Date
}

export interface NotificationFilters {
  type?: string[]
  isRead?: boolean
  dateFrom?: Date
  dateTo?: Date
}

export const useFinanceNotifications = () => {
  const notifications = ref<NotificationData[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const userId = useState<string>('auth:userId')

  // Fetch notifications
  const fetchNotifications = async (filters: NotificationFilters = {}) => {
    if (!userId.value) return

    loading.value = true
    error.value = null

    try {
      // In a real app, this would be an API call
      // For now, we'll simulate with mock data
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          userId: userId.value,
          type: 'DEBT_DUE',
          title: 'Debt Payment Due',
          message: 'Your monthly payment of Rp 2,500,000 for Bank Mandiri loan is due tomorrow.',
          data: { debtId: 'debt-1', amount: 2500000, dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          userId: userId.value,
          type: 'INVESTMENT_UPDATE',
          title: 'Investment Value Update',
          message: 'Your Apple stock investment has increased by 5.2% since last week.',
          data: { investmentId: 'inv-1', symbol: 'AAPL', change: 5.2 },
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          userId: userId.value,
          type: 'BUDGET_ALERT',
          title: 'Budget Alert',
          message: 'You have spent 80% of your monthly food budget.',
          data: { category: 'FOOD', spent: 80, budget: 100 },
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ]

      // Apply filters
      let filtered = mockNotifications.filter(n => n.userId === userId.value)
      
      if (filters.type && filters.type.length > 0) {
        filtered = filtered.filter(n => filters.type!.includes(n.type))
      }
      
      if (filters.isRead !== undefined) {
        filtered = filtered.filter(n => n.isRead === filters.isRead)
      }
      
      if (filters.dateFrom) {
        filtered = filtered.filter(n => n.createdAt >= filters.dateFrom!)
      }
      
      if (filters.dateTo) {
        filtered = filtered.filter(n => n.createdAt <= filters.dateTo!)
      }

      notifications.value = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      unreadCount.value = filtered.filter(n => !n.isRead).length
    } catch (err) {
      error.value = 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
        notification.readAt = new Date()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
        
        // In a real app, this would be an API call
        console.log(`Marked notification ${notificationId} as read`)
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      notifications.value.forEach(n => {
        if (!n.isRead) {
          n.isRead = true
          n.readAt = new Date()
        }
      })
      unreadCount.value = 0
      
      // In a real app, this would be an API call
      console.log('Marked all notifications as read')
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        if (!notification.isRead) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        
        notifications.value = notifications.value.filter(n => n.id !== notificationId)
        
        // In a real app, this would be an API call
        console.log(`Deleted notification ${notificationId}`)
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  // Check for debt due dates and create notifications
  const checkDebtNotifications = async (debts: any[]) => {
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    for (const debt of debts) {
      if (debt.nextPaymentDate) {
        const nextPaymentDate = new Date(debt.nextPaymentDate)
        
        // Check if payment is due tomorrow
        if (nextPaymentDate.toDateString() === tomorrow.toDateString()) {
          const existingNotification = notifications.value.find(n => 
            n.type === 'DEBT_DUE' && 
            n.data?.debtId === debt.id &&
            n.createdAt.toDateString() === today.toDateString()
          )
          
          if (!existingNotification) {
            const notification: NotificationData = {
              userId: debt.userId,
              type: 'DEBT_DUE',
              title: 'Debt Payment Due Tomorrow',
              message: `Your payment of ${formatCurrency(debt.monthlyPayment?.toNumber() || 0)} for ${debt.lenderName} is due tomorrow.`,
              data: { 
                debtId: debt.id, 
                amount: debt.monthlyPayment?.toNumber() || 0, 
                dueDate: nextPaymentDate 
              },
              isRead: false,
              createdAt: new Date()
            }
            
            notifications.value.unshift(notification)
            unreadCount.value++
            
            // Show toast notification
            toast.warning(notification.title, {
              description: notification.message
            })
          }
        }
        
        // Check if payment is overdue
        if (nextPaymentDate < today && debt.status === 'ACTIVE') {
          const existingNotification = notifications.value.find(n => 
            n.type === 'DEBT_OVERDUE' && 
            n.data?.debtId === debt.id &&
            n.createdAt.toDateString() === today.toDateString()
          )
          
          if (!existingNotification) {
            const notification: NotificationData = {
              userId: debt.userId,
              type: 'DEBT_DUE',
              title: 'Debt Payment Overdue',
              message: `Your payment of ${formatCurrency(debt.monthlyPayment?.toNumber() || 0)} for ${debt.lenderName} is overdue.`,
              data: { 
                debtId: debt.id, 
                amount: debt.monthlyPayment?.toNumber() || 0, 
                dueDate: nextPaymentDate 
              },
              isRead: false,
              createdAt: new Date()
            }
            
            notifications.value.unshift(notification)
            unreadCount.value++
            
            // Show toast notification
            toast.error(notification.title, {
              description: notification.message
            })
          }
        }
      }
    }
  }

  // Check for budget alerts
  const checkBudgetAlerts = async (transactions: any[], budgetLimit: number = 1000000) => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    const monthlyExpenses = transactions
      .filter(t => {
        const transactionDate = new Date(t.date)
        return t.type === 'EXPENSE' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + t.amount.toNumber(), 0)
    
    const percentageUsed = (monthlyExpenses / budgetLimit) * 100
    
    if (percentageUsed >= 80 && percentageUsed < 100) {
      const existingNotification = notifications.value.find(n => 
        n.type === 'BUDGET_ALERT' && 
        n.createdAt.toDateString() === today.toDateString()
      )
      
      if (!existingNotification) {
        const notification: NotificationData = {
          userId: userId.value!,
          type: 'BUDGET_ALERT',
          title: 'Budget Alert',
          message: `You have spent ${percentageUsed.toFixed(0)}% of your monthly budget.`,
          data: { spent: percentageUsed, budget: budgetLimit },
          isRead: false,
          createdAt: new Date()
        }
        
        notifications.value.unshift(notification)
        unreadCount.value++
        
        // Show toast notification
        toast.warning(notification.title, {
          description: notification.message
        })
      }
    }
    
    if (percentageUsed >= 100) {
      const existingNotification = notifications.value.find(n => 
        n.type === 'BUDGET_EXCEEDED' && 
        n.createdAt.toDateString() === today.toDateString()
      )
      
      if (!existingNotification) {
        const notification: NotificationData = {
          userId: userId.value!,
          type: 'BUDGET_ALERT',
          title: 'Budget Exceeded',
          message: `You have exceeded your monthly budget by ${formatCurrency(monthlyExpenses - budgetLimit)}.`,
          data: { spent: percentageUsed, budget: budgetLimit, over: monthlyExpenses - budgetLimit },
          isRead: false,
          createdAt: new Date()
        }
        
        notifications.value.unshift(notification)
        unreadCount.value++
        
        // Show toast notification
        toast.error(notification.title, {
          description: notification.message
        })
      }
    }
  }

  // Utility function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  // Auto-refresh notifications every 5 minutes
  let refreshInterval: NodeJS.Timeout | null = null

  const startAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
    
    refreshInterval = setInterval(() => {
      fetchNotifications()
    }, 5 * 60 * 1000) // 5 minutes
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  // Lifecycle
  onMounted(() => {
    fetchNotifications()
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    notifications: readonly(notifications),
    unreadCount: readonly(unreadCount),
    loading: readonly(loading),
    error: readonly(error),
    
    // Methods
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    checkDebtNotifications,
    checkBudgetAlerts
  }
}