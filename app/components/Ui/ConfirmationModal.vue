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
          :disabled="loading"
        >
          {{ cancelText }}
        </UiButton>
        <UiButton
          :variant="destructive ? 'destructive' : 'default'"
          @click="handleConfirm"
          :disabled="loading"
        >
          <Icon v-if="loading" name="ph:spinner" class="h-4 w-4 mr-2 animate-spin" />
          {{ confirmText }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
interface Props {
  open?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: 'Confirm Action',
  description: 'Are you sure you want to perform this action?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  destructive: false,
  loading: false
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}

const handleClose = (value: boolean) => {
  if (!value) {
    emit('cancel')
  }
}
</script>