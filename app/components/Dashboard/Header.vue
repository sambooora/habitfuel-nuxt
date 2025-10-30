
<script lang="ts" setup>
const { $supabase } = useNuxtApp()
 const miniLinks = [
    { name: "About us", href: "#" },
    { name: "Press", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Legal", href: "#" },
    { name: "Support", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Sitemap", href: "#" },
    { name: "Cookie settings", href: "#" },
  ];
  const links = {
    products: {
      items: [
        {
          name: "Blog",
          description: "The latest industry news, updates and info.",
          icon: "lucide:book",
          href: "#",
        },
        {
          name: "About us",
          description: "The latest industry news, updates and info.",
          icon: "lucide:info",
          href: "#",
        },
        {
          name: "Video tutorials",
          description: "All the information you need to know about our platform.",
          icon: "lucide:play-circle",
          href: "#",
        },
        {
          name: "Customer stories",
          description: "See how our customers use our platform to grow their business.",
          icon: "lucide:sparkle",
          href: "#",
        },
        {
          name: "Help center",
          description: "Get all your questions answered in our help center.",
          icon: "lucide:life-buoy",
          href: "#",
        },
      ],
    },
    resources: {
      items: [
        {
          name: "About us",
          description: "The latest industry news, updates and info.",
          icon: "lucide:info",
          href: "#",
        },
        {
          name: "Customer stories",
          description: "See how our customers use our platform to grow their business.",
          icon: "lucide:sparkle",
          href: "#",
        },
        {
          name: "Video tutorials",
          description: "All the information you need to know about our platform.",
          icon: "lucide:play-circle",
          href: "#",
        },
        {
          name: "Help center",
          description: "Get all your questions answered in our help center.",
          icon: "lucide:life-buoy",
          href: "#",
        },
        {
          name: "Blog",
          description: "The latest industry news, updates and info.",
          icon: "lucide:book",
          href: "#",
        },
      ],
    },
  };

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

</script>

<template>
  <div
    class="sticky top-0 z-30"
    :class="isScrolled ? 'px-[1rem] top-1 md:px-0' : ''"
  >
    <div
      :class="[
        'p-6 text-sm items-center transition-all duration-300',
        isScrolled ? 'bg-gray-900 container px-3 rounded-full  m-[10px] shadow-md mx-auto' : 'bg-gray-900 border-b border-gray-800 w-full',
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
          </UiNavigationMenuList>
          </UiNavigationMenu>
          <div class="lg:hidden">
            </div>
            <div class="hidden items-center gap-3 lg:flex">
              <UiButton @click="logout" variant="destructive">Logout</UiButton>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
