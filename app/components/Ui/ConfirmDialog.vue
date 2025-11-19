<template>
  <UiDialog :open="isOpen" @update:open="handleClose">
    <UiDialogContent class="sm:max-w-md">
      <UiDialogHeader>
        <UiDialogTitle>{{ title }}</UiDialogTitle>
        <UiDialogDescription>
          {{ description }}
        </UiDialogDescription>
      </UiDialogHeader>
      
      <div class="flex justify-end gap-3 pt-4">
        <UiButton
          variant="outline"
          @click="handleCancel"
        >
          {{ cancelText }}
        </UiButton>
        <UiButton
          :variant="variant === 'destructive' ? 'destructive' : 'default'"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

interface Emits {
  'update:isOpen': [value: boolean]
  'confirm': []
  'cancel': []
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'default'
})

const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
  emit('update:isOpen', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}

const handleClose = (value: boolean) => {
  emit('update:isOpen', value)
  if (!value) {
    emit('cancel')
  }
}
</script>