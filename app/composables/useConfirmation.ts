import { ref, readonly } from 'vue'

export interface ConfirmationOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
  showClose?: boolean
}

export interface ConfirmationResult {
  confirmed: boolean
  cancelled: boolean
}

/**
 * Composable for handling confirmation dialogs
 * Provides consistent confirmation UX across the application
 */
export const useConfirmation = () => {
  const isConfirming = ref(false)
  const confirmationOptions = ref<ConfirmationOptions | null>(null)
  const resolvePromise = ref<((result: ConfirmationResult) => void) | null>(null)

  /**
   * Show a confirmation dialog
   */
  const confirm = (options: ConfirmationOptions): Promise<ConfirmationResult> => {
    return new Promise((resolve) => {
      isConfirming.value = true
      confirmationOptions.value = {
        title: 'Konfirmasi',
        confirmText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
        type: 'warning',
        showClose: true,
        ...options
      }
      resolvePromise.value = resolve
    })
  }

  /**
   * Handle confirmation
   */
  const handleConfirm = () => {
    isConfirming.value = false
    if (resolvePromise.value) {
      resolvePromise.value({ confirmed: true, cancelled: false })
      resolvePromise.value = null
    }
    confirmationOptions.value = null
  }

  /**
   * Handle cancellation
   */
  const handleCancel = () => {
    isConfirming.value = false
    if (resolvePromise.value) {
      resolvePromise.value({ confirmed: false, cancelled: true })
      resolvePromise.value = null
    }
    confirmationOptions.value = null
  }

  /**
   * Show delete confirmation for financial items
   */
  const confirmDelete = async (itemType: string, itemName?: string): Promise<boolean> => {
    const result = await confirm({
      title: 'Hapus ' + itemType,
      message: `Apakah Anda yakin ingin menghapus ${itemType.toLowerCase()}${itemName ? ` "${itemName}"` : ''}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger'
    })

    return result.confirmed
  }

  /**
   * Show bulk delete confirmation
   */
  const confirmBulkDelete = async (itemType: string, count: number): Promise<boolean> => {
    const result = await confirm({
      title: 'Hapus Beberapa ' + itemType,
      message: `Apakah Anda yakin ingin menghapus ${count} ${itemType.toLowerCase()}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Semua',
      cancelText: 'Batal',
      type: 'danger'
    })

    return result.confirmed
  }

  /**
   * Show update confirmation
   */
  const confirmUpdate = async (itemType: string, itemName?: string): Promise<boolean> => {
    const result = await confirm({
      title: 'Perbarui ' + itemType,
      message: `Apakah Anda yakin ingin memperbarui ${itemType.toLowerCase()}${itemName ? ` "${itemName}"` : ''}?`,
      confirmText: 'Ya, Perbarui',
      cancelText: 'Batal',
      type: 'info'
    })

    return result.confirmed
  }

  return {
    // Reactive state
    isConfirming: readonly(isConfirming),
    confirmationOptions: readonly(confirmationOptions),

    // Methods
    confirm,
    handleConfirm,
    handleCancel,
    confirmDelete,
    confirmBulkDelete,
    confirmUpdate
  }
}

/**
 * Composable for handling financial operations with confirmation
 */
export const useFinancialOperations = () => {
  const { confirmDelete, confirmUpdate } = useConfirmation()
  const { 
    updateTransaction, 
    updateInvestment, 
    updateDebt, 
    updateAsset,
    deleteTransaction, 
    deleteInvestment, 
    deleteDebt, 
    deleteAsset 
  } = useFinance()

  /**
   * Update financial item with confirmation
   */
  const updateFinancialItem = async (
    type: 'transaction' | 'investment' | 'debt' | 'asset',
    id: string,
    data: any,
    itemName?: string
  ): Promise<any> => {
    const confirmed = await confirmUpdate(type, itemName)
    if (!confirmed) {
      throw new Error('Update cancelled by user')
    }

    switch (type) {
      case 'transaction':
        return await updateTransaction(id, data)
      case 'investment':
        return await updateInvestment(id, data)
      case 'debt':
        return await updateDebt(id, data)
      case 'asset':
        return await updateAsset(id, data)
      default:
        throw new Error(`Unknown financial item type: ${type}`)
    }
  }

  /**
   * Delete financial item with confirmation
   */
  const deleteFinancialItem = async (
    type: 'transaction' | 'investment' | 'debt' | 'asset',
    id: string,
    itemName?: string
  ): Promise<any> => {
    const confirmed = await confirmDelete(type, itemName)
    if (!confirmed) {
      throw new Error('Deletion cancelled by user')
    }

    switch (type) {
      case 'transaction':
        return await deleteTransaction(id, true)
      case 'investment':
        return await deleteInvestment(id, true)
      case 'debt':
        return await deleteDebt(id, true)
      case 'asset':
        return await deleteAsset(id, true)
      default:
        throw new Error(`Unknown financial item type: ${type}`)
    }
  }

  /**
   * Bulk delete financial items with confirmation
   */
  const bulkDeleteFinancialItems = async (
    type: 'transaction' | 'investment' | 'debt' | 'asset',
    ids: string[],
    itemName?: string
  ): Promise<any[]> => {
    const confirmed = await confirmBulkDelete(type, ids.length)
    if (!confirmed) {
      throw new Error('Bulk deletion cancelled by user')
    }

    const results = []
    for (const id of ids) {
      try {
        const result = await deleteFinancialItem(type, id, itemName)
        results.push({ id, success: true, result })
      } catch (error) {
        results.push({ id, success: false, error: error.message })
      }
    }

    return results
  }

  return {
    updateFinancialItem,
    deleteFinancialItem,
    bulkDeleteFinancialItems
  }
}