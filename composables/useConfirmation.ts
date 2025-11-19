import { h, ref } from 'vue'

export interface ConfirmationOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export const useConfirmation = () => {
  const showModal = ref(false)
  const modalOptions = ref<ConfirmationOptions>({
    title: 'Confirm Action',
    description: 'Are you sure you want to perform this action?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default'
  })

  let resolvePromise: ((value: boolean) => void) | null = null

  const confirmDelete = async (
    itemType: string,
    itemName?: string,
    options: ConfirmationOptions = {}
  ): Promise<boolean> => {
    console.log('confirmDelete called with:', itemType, itemName)
    
    try {
      const defaultOptions = {
        title: `Delete ${itemType}`,
        description: itemName ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.` : `Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive' as const
      }

      modalOptions.value = { ...defaultOptions, ...options }
      console.log('Modal options set:', modalOptions.value)
      
      return new Promise((resolve) => {
        console.log('Creating promise for modal confirmation')
        resolvePromise = resolve
        console.log('Setting showModal to true')
        showModal.value = true
        console.log('Modal visibility set to true, current state:', showModal.value)
        console.log('Promise created, waiting for user action...')
      })
    } catch (error) {
      console.error('Error in confirmDelete:', error)
      throw error
    }
  }

  const confirmAction = async (
    title: string,
    description: string,
    options: ConfirmationOptions = {}
  ): Promise<boolean> => {
    const defaultOptions = {
      title,
      description,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      variant: options.variant || 'default'
    }

    modalOptions.value = defaultOptions
    
    return new Promise((resolve) => {
      resolvePromise = resolve
      showModal.value = true
    })
  }

  const handleModalConfirm = () => {
    try {
      console.log('Modal confirm clicked')
      console.log('Current resolvePromise:', resolvePromise)
      if (resolvePromise) {
        console.log('Resolving promise with true')
        resolvePromise(true)
        resolvePromise = null
        console.log('Promise resolved and reset')
      } else {
        console.log('No resolvePromise found!')
      }
      showModal.value = false
      console.log('Modal hidden after confirm')
    } catch (error) {
      console.error('Error in handleModalConfirm:', error)
    }
  }

  const handleModalCancel = () => {
    try {
      console.log('Modal cancel clicked')
      console.log('Current resolvePromise:', resolvePromise)
      if (resolvePromise) {
        console.log('Resolving promise with false')
        resolvePromise(false)
        resolvePromise = null
        console.log('Promise resolved and reset')
      } else {
        console.log('No resolvePromise found!')
      }
      showModal.value = false
      console.log('Modal hidden after cancel')
    } catch (error) {
      console.error('Error in handleModalCancel:', error)
    }
  }

  return {
    confirmDelete,
    confirmAction,
    showModal,
    modalOptions,
    handleModalConfirm,
    handleModalCancel
  }
}