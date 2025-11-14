<template>
  <div class="relative">
    <!-- Notification Bell -->
    <UiButton
      variant="ghost"
      size="sm"
      @click="toggleNotifications"
      class="relative"
    >
      <Icon name="ph:bell" class="h-5 w-5" />
      <UiBadge
        v-if="unreadCount > 0"
        variant="destructive"
        class="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </UiBadge>
    </UiButton>

    <!-- Notifications Dropdown -->
    <Transition name="fade">
      <div
        v-if="showNotifications"
        class="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          <div class="flex items-center gap-2">
            <UiButton
              v-if="unreadCount > 0"
              variant="ghost"
              size="xs"
              @click="markAllAsRead"
            >
              Mark all read
            </UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              @click="showNotifications = false"
            >
              <Icon name="ph:x" class="h-4 w-4" />
            </UiButton>
          </div>
        </div>

        <!-- Filters -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex gap-2">
            <UiButton
              v-for="filter in filterOptions"
              :key="filter.value"
              :variant="activeFilter === filter.value ? 'default' : 'outline'"
              size="xs"
              @click="setFilter(filter.value)"
            >
              {{ filter.label }}
            </UiButton>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="loading" class="p-8 text-center">
            <Icon name="svg-spinners:ring-resize" class="h-6 w-6 mx-auto text-gray-400" />
            <p class="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>

          <div v-else-if="filteredNotifications.length === 0" class="p-8 text-center">
            <Icon name="ph:bell-slash" class="h-12 w-12 mx-auto text-gray-400" />
            <p class="text-sm text-gray-500 mt-2">
              {{ activeFilter === 'all' ? 'No notifications' : `No ${activeFilter} notifications` }}
            </p>
          </div>

          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.isRead }"
            >
              <div class="flex items-start gap-3">
                <!-- Notification Icon -->
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="getNotificationIcon(notification.type).bgColor"
                  >
                    <Icon
                      :name="getNotificationIcon(notification.type).icon"
                      class="w-4 h-4"
                      :class="getNotificationIcon(notification.type).color"
                    />
                  </div>
                </div>

                <!-- Notification Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ notification.title }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ notification.message }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {{ formatTimeAgo(notification.createdAt) }}
                      </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-1">
                      <UiButton
                        v-if="!notification.isRead"
                        variant="ghost"
                        size="xs"
                        @click="markAsRead(notification.id!)"
                      >
                        <Icon name="ph:check" class="h-3 w-3" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="xs"
                        @click="deleteNotification(notification.id!)"
                      >
                        <Icon name="ph:trash" class="h-3 w-3" />
                      </UiButton>
                    </div>
                  </div>

                  <!-- Action Buttons (if applicable) -->
                  <div v-if="getNotificationActions(notification.type)" class="mt-3 flex gap-2">
                    <UiButton
                      v-for="action in getNotificationActions(notification.type)"
                      :key="action.label"
                      :variant="action.variant || 'outline'"
                      size="xs"
                      @click="handleNotificationAction(notification, action)"
                    >
                      {{ action.label }}
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Showing {{ filteredNotifications.length }} of {{ notifications.length }} notifications
            </p>
            <UiButton
              variant="ghost"
              size="xs"
              @click="refreshNotifications"
            >
              <Icon name="ph:arrows-clockwise" class="h-3 w-3 mr-1" />
              Refresh
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { NotificationData } from '~/composables/useFinanceNotifications'

const { 
  notifications, 
  unreadCount, 
  loading, 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = useFinanceNotifications()

const showNotifications = ref(false)
const activeFilter = ref<'all' | 'unread' | 'debt' | 'investment' | 'budget'>('all')

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Debt', value: 'debt' },
  { label: 'Investment', value: 'investment' },
  { label: 'Budget', value: 'budget' }
]

const filteredNotifications = computed(() => {
  switch (activeFilter.value) {
    case 'unread':
      return notifications.value.filter(n => !n.isRead)
    case 'debt':
      return notifications.value.filter(n => n.type === 'DEBT_DUE')
    case 'investment':
      return notifications.value.filter(n => n.type === 'INVESTMENT_UPDATE')
    case 'budget':
      return notifications.value.filter(n => n.type === 'BUDGET_ALERT')
    default:
      return notifications.value
  }
})

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'DEBT_DUE':
      return {
        icon: 'ph:warning-circle',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20'
      }
    case 'INVESTMENT_UPDATE':
      return {
        icon: 'ph:chart-line',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20'
      }
    case 'BUDGET_ALERT':
      return {
        icon: 'ph:piggy-bank',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20'
      }
    case 'TRANSACTION_REMINDER':
      return {
        icon: 'ph:bell',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20'
      }
    default:
      return {
        icon: 'ph:info',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-900/20'
      }
  }
}

const getNotificationActions = (type: string) => {
  switch (type) {
    case 'DEBT_DUE':
      return [
        { label: 'Pay Now', variant: 'default' as const },
        { label: 'View Details', variant: 'outline' as const }
      ]
    case 'INVESTMENT_UPDATE':
      return [
        { label: 'View Investment', variant: 'outline' as const }
      ]
    case 'BUDGET_ALERT':
      return [
        { label: 'View Budget', variant: 'outline' as const }
      ]
    default:
      return null
  }
}

const handleNotificationAction = (notification: NotificationData, action: any) => {
  switch (notification.type) {
    case 'DEBT_DUE':
      if (action.label === 'Pay Now') {
        // Navigate to debt payment
        navigateTo('/dashboard/finance?tab=debts')
      } else if (action.label === 'View Details') {
        // Show debt details
        console.log('View debt details:', notification.data?.debtId)
      }
      break
    case 'INVESTMENT_UPDATE':
      // Navigate to investments
      navigateTo('/dashboard/finance?tab=investments')
      break
    case 'BUDGET_ALERT':
      // Navigate to budget
      navigateTo('/dashboard/finance?tab=transactions')
      break
  }
  
  // Mark as read after action
  if (notification.id && !notification.isRead) {
    markAsRead(notification.id)
  }
  
  // Close notifications panel
  showNotifications.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    refreshNotifications()
  }
}

const setFilter = (filter: string) => {
  activeFilter.value = filter as any
}

const refreshNotifications = async () => {
  await fetchNotifications()
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

// Close notifications when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.notification-container')) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>