<script setup lang="ts">
import { tv } from 'tailwind-variants'

const button = tv({
  base: 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  variants: {
    variant: {
      default: 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200',
      outline: 'border border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800',
      ghost: 'text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800',
    },
    size: {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-5 text-base',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

type ButtonVariant = 'default' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'
type Props = { as?: string; variant?: ButtonVariant; size?: ButtonSize }
const props = withDefaults(defineProps<Props>(), { as: 'button', variant: 'default', size: 'md' })
</script>
<template>
  <component :is="props.as" :class="button({ variant: props.variant, size: props.size })">
    <slot />
  </component>
</template>
