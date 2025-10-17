
<script lang="ts" setup>

const navLinks = [
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Contact', href: '#' },
]

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

</script>

<template>
  <div
    class="sticky top-0 z-30"
    :class="isScrolled ? 'px-[1rem] top-1 md:px-0' : ''"
  >
    <nav
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
        </div>
      </div>
    </nav>
  </div>
</template>
