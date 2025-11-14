
<script lang="ts" setup>
const { $supabase } = useNuxtApp()
const isScrolled = ref(false)

// Fungsi untuk mendeteksi scroll
const handleScroll = () => {
  isScrolled.value = window.scrollY > 30
}

// Menambahkan event listener untuk scroll
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

// Membersihkan event listener saat komponen dihapus
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const logout = async (): Promise<void> => {
  if ($supabase) {
    await ($supabase as any).auth.signOut()
  }
  navigateTo('/login')
}

import { useTheme } from '~/composables/useTheme'

const theme = useTheme()
</script>

<template>
  <div
    class="sticky top-0 z-30 text-grey-800 dark:text-muted-foreground"
    :class="isScrolled ? 'px-[1rem] top-1 md:px-0' : ''"
  >
    <div
      :class="[
        'p-6 text-sm items-center transition-all duration-300',
        isScrolled ? 'container px-3 rounded-full  m-[10px] shadow-md mx-auto' : ' w-full',
      ]"
    >
      <div class="container mx-auto flex flex-col max-h-screen">
        <div class="flex justify-between items-center w-full lg:px-1 gap-2">
          <NuxtLink
            class="flex items-center gap-2"
          >
            <Icon name="ph:rocket-launch-duotone" class="size-6 shrink-0" />
            <span class="font-semibold">HabitFuel</span>
          </NuxtLink>
           <UiNavigationMenu as="nav" class="hidden items-center justify-start gap-8 lg:flex">
          <UiNavigationMenuList class="gap-2">
            <UiNavigationMenuItem>
              <UiNavigationMenuLink as-child>
                <UiButton to="/" variant="ghost" size="sm"> Home</UiButton>
              </UiNavigationMenuLink>
            </UiNavigationMenuItem>
            <UiNavigationMenuItem>
              <UiNavigationMenuLink as-child>
                <UiButton to="/dashboard/pomodoro" variant="ghost" size="sm"> Pomodoro</UiButton>
              </UiNavigationMenuLink>
            </UiNavigationMenuItem>
            <UiNavigationMenuItem>
              <UiNavigationMenuLink as-child>
                <UiButton to="/dashboard/finance" variant="ghost" size="sm"> Finance</UiButton>
              </UiNavigationMenuLink>
            </UiNavigationMenuItem>
          </UiNavigationMenuList>
          </UiNavigationMenu>
          <div class="lg:hidden">
            </div>
            <div class="hidden items-center gap-3 lg:flex">
              <UiButton
                  class="inline-flex items-center justify-center p-2 rounded-md transition-colors"
                  @click="theme.toggleTheme()"
                  aria-label="Toggle theme"
                  title="Toggle theme"
                >
                  <Icon
                    :name="theme.isDark.value ? 'ph:moon' : ' ph:sun'"
                    class="size-5 transition-transform duration-200 text-grey-800 dark:text-muted-foreground"
                    :class="theme.isDark.value ? 'rotate-0 scale-100' : 'rotate-180 scale-95'"
                  />
              </UiButton>
              <UiButton @click="logout" variant="destructive">Logout</UiButton>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
