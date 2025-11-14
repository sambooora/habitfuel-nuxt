<template>
  <div class="relative">
    <!-- Mobile Hamburger Button -->
    <button
      @click="toggleSidebar"
      class="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-250 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-105 active:scale-95 will-change-transform"
      :class="{ 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800': isOpen }"
      aria-label="Toggle navigation menu"
      :aria-expanded="isOpen"
      aria-controls="sidebar"
      :aria-busy="isAnimating"
    >
      <div class="relative w-6 h-6">
        <!-- Hamburger Icon -->
        <svg
          class="absolute inset-0 w-6 h-6 transition-all duration-250 cubic-bezier(0.4, 0, 0.2, 1)"
          :class="{ 'opacity-0 rotate-90 scale-75': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <!-- Close Icon -->
        <svg
          class="absolute inset-0 w-6 h-6 transition-all duration-250 cubic-bezier(0.4, 0, 0.2, 1)"
          :class="{ 'opacity-100 rotate-0 scale-100': isOpen, 'opacity-0 -rotate-90 scale-75': !isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    </button>

    <!-- Mobile Overlay -->
    <div
      v-if="isOpen && isMobile"
      @click="closeSidebar"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-250 cubic-bezier(0.4, 0, 0.2, 1)"
      :class="{ 'opacity-100': isOpen, 'opacity-0': !isOpen }"
      :style="{ willChange: 'opacity' }"
      aria-hidden="true"
    ></div>

    <!-- Sidebar -->
    <aside
      id="sidebar"
      ref="sidebarElement"
      :class="[
        'fixed top-0 left-0 h-full z-40',
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
        'transform transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1)',
        'will-change-transform',
        {
          'w-64 translate-x-0': !isCollapsed && (isOpen || !isMobile),
          'w-18 translate-x-0': isCollapsed && (isOpen || !isMobile),
          '-translate-x-full': !isOpen && isMobile,
          'sidebar-expanded': !isCollapsed,
          'sidebar-collapsed': isCollapsed
        }
      ]"
      :style="{
        willChange: 'transform, width',
        contain: 'layout style paint',
        transformOrigin: 'left center'
      }"
      role="navigation"
      aria-label="Main navigation"
      :aria-expanded="!isCollapsed"
      :aria-busy="isAnimating"
      @transitionstart="handleTransitionStart"
      @transitionend="handleTransitionEnd"
    >
      <!-- Branding/Logo Section -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex items-center gap-3 transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1)" v-if="!isCollapsed" :style="{ willChange: 'transform, opacity' }">
           <button
          v-if="!isMobile"
          @click="toggleCollapse"
          class="transform transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-110 hover:rotate-3 will-change-transform"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          :aria-busy="isAnimating"
        >
         <Icon name="ph:rocket-launch-duotone" class="size-6 shrink-0" />
         </button>
          <span class="font-semibold transform transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1)">HabitFuel</span>
        </div>
        <div v-else class="w-full flex justify-center items-center transform transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1)" :style="{ willChange: 'transform, opacity' }">
          <button
          v-if="!isMobile"
          @click="toggleCollapse"
          class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-110 hover:rotate-3 will-change-transform"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          :aria-busy="isAnimating"
        >
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform transition-transform duration-280 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-110 hover:rotate-3">
          <Icon name="ph:rocket-launch-duotone" class="size-6 shrink-0" />
        </div>
        </button>
        </div>
        
        <!-- Collapse/Expand Button (Desktop only) -->
        
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-2">
        <NuxtLink
          v-for="(item, index) in navigationItems"
          :key="item.to"
          :to="item.to"
          @click="handleNavigation"
          class="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1) group transform will-change-transform nav-item-enter"
          :class="[
            isActive(item.to)
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
          ]"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :tabindex="0"
          @keydown.enter="$router.push(item.to)"
          @keydown.space.prevent="$router.push(item.to)"
          :style="{ willChange: 'transform, background-color, color', '--item-index': index }"
        >
          <!-- Icon -->
          <div class="flex justify-center items-center w-8 h-8 transform transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1) group-hover:scale-110">
            <Icon
              :name="item.icon"
              class="w-6 h-6"
              :class="[
                isActive(item.to)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
              ]"
              :style="{ willChange: 'color, transform' }"
            />
          </div>
          
          <!-- Text (shown when expanded) -->
          <span
            v-if="!isCollapsed"
            class="font-medium transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1) transform"
            :style="{ willChange: 'opacity, transform' }"
          >
            {{ item.label }}
          </span>
          
          <!-- Tooltip (shown when collapsed) -->
          <div
            v-if="isCollapsed && !isMobile"
            class="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-280 cubic-bezier(0.4, 0, 0.2, 1) transform translate-x-2 group-hover:translate-x-0 pointer-events-none z-50"
            :style="{ willChange: 'opacity, transform' }"
          >
            {{ item.label }}
          </div>
          
          <!-- Active indicator -->
          <div
            v-if="isActive(item.to) && !isCollapsed"
            class="ml-auto w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-full"
          ></div>
        </NuxtLink>
      </nav>

      <!-- Footer Section -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="flex items-center gap-3 w-full px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Icon :name="isDark ? 'ph:sun' : 'ph:moon'" class="size-6 shrink-0" />
          <span v-if="!isCollapsed" class="font-medium">
            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
          </span>
        </button>

        <!-- Logout Button -->
        <button
          @click="handleLogout"
          class="flex items-center gap-3 w-full px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group mt-2"
          aria-label="Sign out"
        >
          <Icon name="ph:sign-out" class="size-6 shrink-0" />
          <span v-if="!isCollapsed" class="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'

const route = useRoute()
const router = useRouter()

// Component state
const isOpen = ref(false)
const isCollapsed = ref(false)
const isMobile = ref(false)
const isDark = ref(false)
const isAnimating = ref(false)
const sidebarElement = ref<HTMLElement | null>(null)

// Animation state management
const handleTransitionStart = () => {
  isAnimating.value = true
  if (sidebarElement.value) {
    sidebarElement.value.style.willChange = 'transform, width'
  }
}

const handleTransitionEnd = () => {
  isAnimating.value = false
  if (sidebarElement.value) {
    sidebarElement.value.style.willChange = 'auto'
  }
}

// Navigation items
const navigationItems = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: 'ph:house'
  },
  {
    to: '/dashboard/pomodoro',
    label: 'Pomodoro',
    icon: 'ph:timer'
  },
  {
    to: '/dashboard/finance',
    label: 'Finance',
    icon: 'ph:chart-line'
  }
]


// Computed properties
const isActive = (path: string) => {
  return route.path === path
}

// Methods
const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const closeSidebar = () => {
  isOpen.value = false
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', isCollapsed.value.toString())
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const handleNavigation = () => {
  if (isMobile.value) {
    closeSidebar()
  }
}

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    isOpen.value = true // Always open on desktop
  } else {
    isOpen.value = false // Closed by default on mobile
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Load saved preferences
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  const savedTheme = localStorage.getItem('theme')
  
  if (savedCollapsed !== null) {
    isCollapsed.value = savedCollapsed === 'true'
  }
  
  if (savedTheme !== null) {
    isDark.value = savedTheme === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Custom cubic-bezier timing function for natural easing */
.cubic-bezier {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hardware acceleration and will-change optimizations */
.sidebar-enhanced {
  will-change: transform, width;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Custom scrollbar for sidebar */
aside::-webkit-scrollbar {
  width: 4px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
  transition: background-color 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

aside::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark aside::-webkit-scrollbar-thumb {
  background: #475569;
  transition: background-color 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dark aside::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Enhanced transitions with hardware acceleration */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Duration 250ms for optimal perceived performance */
.duration-250 {
  transition-duration: 250ms;
}

/* Duration 280ms for more complex animations */
.duration-280 {
  transition-duration: 280ms;
}

/* Focus styles for accessibility with enhanced visibility */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  transition: outline-offset 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

button:focus-visible:hover,
a:focus-visible:hover {
  outline-offset: 4px;
}

/* Enhanced active state indicator animation with overshoot */
@keyframes slideInEnhanced {
  0% {
    transform: translateX(-8px) scale(0.9);
    opacity: 0;
  }
  60% {
    transform: translateX(2px) scale(1.02);
    opacity: 0.9;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes overshoot {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  70% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideInFromLeft {
  0% {
    transform: translateX(-20px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes elasticScale {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes smoothFadeIn {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Apply enhanced animations */
.sidebar-expanded {
  animation: overshoot 280ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform-origin: left center;
}

.sidebar-collapsed {
  animation: slideInFromLeft 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform-origin: left center;
}

/* Active state with enhanced animation */
.bg-blue-100 {
  animation: slideInEnhanced 280ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Enhanced hover effects with subtle animations */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1) translateZ(0);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  animation: elasticScale 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.group:hover .group-hover\:translate-x-1 {
  transform: translateX(4px) translateZ(0);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover .group-hover\:translate-x-0 {
  transform: translateX(0) translateZ(0);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced tooltip animations */
.group:hover .group-hover\:opacity-100 {
  animation: smoothFadeIn 180ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform-origin: left center;
}

/* Button press animations */
button:active,
a:active {
  transform: scale(0.98) translateZ(0);
  transition: transform 100ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced mobile overlay animation */
.overlay-enter {
  animation: fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.overlay-leave {
  animation: fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Browser compatibility and graceful degradation */
@supports not (transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)) {
  .transition-all {
    transition-timing-function: ease-in-out;
  }
}

@supports not (will-change: transform) {
  .sidebar-enhanced {
    transform: none;
  }
}

/* Reduced motion support for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
  }
  
  .transition-all,
  .duration-250,
  .duration-280 {
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  button:focus-visible,
  a:focus-visible {
    outline-width: 3px;
    outline-color: #1e40af;
  }
}

/* Print styles */
@media print {
  aside {
    display: none !important;
  }
}

/* Advanced animation for navigation items */
.nav-item-enter {
  animation: navItemEnter 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--item-index, 0) * 50ms);
}

@keyframes navItemEnter {
  0% {
    opacity: 0;
    transform: translateX(-16px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Enhanced focus ring animation */
@keyframes focusRing {
  0% {
    outline-offset: 2px;
    outline-width: 2px;
  }
  50% {
    outline-offset: 4px;
    outline-width: 3px;
  }
  100% {
    outline-offset: 2px;
    outline-width: 2px;
  }
}

button:focus-visible:focus-visible,
a:focus-visible:focus-visible {
  animation: focusRing 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>