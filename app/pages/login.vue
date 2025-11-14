<script setup lang="ts">

definePageMeta({
  layout: 'auth',
  title: 'Login',
})
const { $supabase } = useNuxtApp()

  useSeoMeta({
    title: "Log in",
    description: "Enter your email & password to log in.",
  });

  const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(z.object({
    email: z.string().min(1),
    password: z.string().min(8).max(32),
  })),
  keepValuesOnUnmount: true,
})

  const isSubmitting = useIsSubmitting()

  

  const login = handleSubmit( async (values): Promise<void> => {
  if (!$supabase) throw new Error('Supabase client not available')
  const { error, data } = await ($supabase as any).auth.signInWithPassword({
    email: values.email,
    password: values.password
  })
  if (error) alert(error.message)
  else {
    // Set user ID in state after successful login
    if (data?.user?.id) {
      useState('auth:userId', () => data.user.id)
    }
    navigateTo('/dashboard')
  }
});
</script>

<template>
    <div class="border border-muted-foreground rounded-lg p-5">
      <h1 class="text-2xl font-bold tracking-tight lg:text-3xl">Log in</h1>
      <p class="mt-1 text-muted-foreground">Enter your email & password to log in.</p>

      <form class="mt-10" @submit="login">
        <fieldset :disabled="isSubmitting" class="grid gap-5">
          <div>
            <UiVeeInput label="Email" type="email" name="email" placeholder="john@example.com" />
          </div>
          <div>
            <UiVeeInput label="Password" type="password" name="password" />
          </div>
          <div>
            <UiButton variant="green" class="w-full" type="submit" text="Log in" />
          </div>
        </fieldset>
      </form>
      <p class="mt-4 text-sm text-muted-foreground">
        Don't have an account?
        <NuxtLink class="font-semibold text-primary underline-offset-2 hover:underline" to="/signup"
          >Create account</NuxtLink
        >
      </p>
    </div>
</template>
