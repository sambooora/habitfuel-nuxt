<script lang="ts">
/* eslint-disable import/first */
// Add here because button styles are used in several components
export const buttonStyles = tv({
  base: 'group inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outlineDestructive: 'border border-destructive bg-background hover:bg-destructive hover:text-destructive-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      outlinePrimary: 'border border-primary bg-background hover:bg-primary hover:text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outlineSecondary: 'border border-secondary bg-background hover:bg-secondary hover:text-secondary-foreground',
      green: 'bg-green-500 text-white hover:bg-green-500/80',
      outlineGreen: 'border border-green-500 bg-background hover:bg-green-500 hover:text-white',
      yellow: 'bg-yellow-500 text-white hover:bg-yellow-500/80',
      outlineYellow: 'border border-yellow-500 bg-background hover:bg-yellow-500 hover:text-white',
      sky: 'bg-sky-400 text-white hover:bg-sky-400/80',
      outlineSky: 'border border-sky-400 bg-background hover:bg-sky-400 hover:text-white',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      expandIcon: 'group relative bg-primary text-primary-foreground hover:bg-primary/90',
      ringHover: 'bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2',
      shine: 'animate-shine bg-gradient-to-r from-primary via-primary/75 to-primary bg-[length:400%_100%] text-primary-foreground',
      gooeyRight: 'relative z-0 overflow-hidden bg-primary from-primary-foreground/40 text-primary-foreground transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r before:transition-transform before:duration-1000 hover:before:translate-x-[0%] hover:before:translate-y-[0%]',
      gooeyLeft: 'relative z-0 overflow-hidden bg-primary from-primary-foreground/40 text-primary-foreground transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l after:transition-transform after:duration-1000 hover:after:translate-x-[0%] hover:after:translate-y-[0%]',
      linkHover1: 'relative after:absolute after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-bottom-right hover:after:scale-x-0',
      linkHover2: 'relative after:absolute after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-bottom-left hover:after:scale-x-100',
    },
    size: {
      'xs': 'h-8 px-2',
      'sm': 'h-9 px-3',
      'default': 'h-10 px-4 py-2',
      'lg': 'h-11 px-8',
      'icon-xs': 'h-8 w-8',
      'icon-sm': 'h-9 w-9',
      'icon': 'h-10 w-10',
    },
    disabled: {
      true: 'pointer-events-none opacity-50',
    },
    hasIcon: {
      false: 'gap-2',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})
</script>

<script setup lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { useForwardPropsEmits } from 'radix-vue'
import { tv } from 'tailwind-variants'
import type { NuxtLinkProps } from '#app'

type ButtonProps = VariantProps<typeof buttonStyles>
const props = withDefaults(defineProps<NuxtLinkProps & {
  /** The type fro the button */
  type?: 'button' | 'submit' | 'reset'
  /** Whether the button is disabled */
  disabled?: boolean
  /** Whether the button is loading */
  loading?: boolean
  /** The element to render the button as */
  as?: string
  /** Custom class(es) to add to parent element */
  class?: HTMLAttributes['class']
  /** The variant of the button */
  variant?: ButtonProps['variant']
  /** The size of the button */
  size?: ButtonProps['size']
  /** The text to display in the button */
  text?: string
  /** Should the icon be displayed on the `left` or the `right`? */
  iconPlacement?: 'left' | 'right'
  /** The icon to display in the button */
  icon?: string
}>(), {
  type: 'button',
  iconPlacement: 'left',
  size: 'default',
})

const emit = defineEmits<{
  click: [Event]
}>()

const elementType = computed(() => {
  if (props.as) return props.as
  if (props.href || props.to || props.target) return resolveComponent('NuxtLink')
  return 'button'
})

const forwarded = useForwardPropsEmits(reactiveOmit(props, 'class', 'text', 'icon', 'iconPlacement', 'size', 'variant', 'as', 'loading', 'disabled'), emit)
</script>

<template>
  <component
    :is="elementType"
    :class="buttonStyles({
      hasIcon: !!icon,
      disabled: disabled || loading,
      variant: variant,
      size: size,
      class: props.class,
    })"
    :disabled="disabled || loading"
    v-bind="forwarded"
    aria-label="button"
  >
    <template v-if="loading">
      <Icon
        name="lucide:loader"
        class="size-5 animate-spin"
      />
      <span
        v-if="!['icon', 'icon-xs', 'icon-sm'].includes(size)"
        class="animate-pulse"
      >Please Wait . . .</span>
    </template>
    <template v-else>
      <slot name="iconLeft">
        <div
          v-if="icon && iconPlacement === 'left'"
          class="flex items-center shrink-0 justify-center transition-all duration-200 w-6 pr-2"
        >
          <Icon
            :name="icon"
            class="size-5"
          />
        </div>
      </slot>
      <slot>
        <span v-if="text">{{ text }}</span>
      </slot>
      <slot name="iconRight">
        <div
          v-if="icon && iconPlacement === 'right'"
          class="flex items-center justify-center shrink-0 transition-all duration-200 w-6 pl-2"
        >
          <Icon
            :name="icon"
            class="size-5"
          />
        </div>
      </slot>
    </template>
  </component>
</template>
