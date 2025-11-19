<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <Toaster />
    </ClientOnly>
  </div>
</template>
