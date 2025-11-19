<template>
  <UiDialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <UiDialogContent class="sm:max-w-[600px]">
      <UiDialogHeader>
        <UiDialogTitle>{{ isEditing ? 'Edit Transaction' : 'Add New Transaction' }}</UiDialogTitle>
        <UiDialogDescription>
          {{ isEditing ? 'Update the transaction details below.' : 'Record a new financial transaction. Fill in the details below.' }}
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <!-- Transaction Type -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="type" class="text-right">Type</Label>
            <div class="col-span-3">
              <UiVeeSelect name="type" placeholder="Select transaction type">
                <option v-for="option in transactionTypes" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </UiVeeSelect>
            </div>
          </div>

          <!-- Amount -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="amount" class="text-right">Amount</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput name="amount" placeholder="Enter amount" :options="{ currency: 'IDR' }" />
            </div>
          </div>

          <!-- Description -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="description" class="text-right">Description</Label>
            <div class="col-span-3">
              <UiVeeTextarea name="description" placeholder="Enter description" :rows="2" />
            </div>
          </div>

          <!-- Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="date" class="text-right">Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker name="date" placeholder="Select date" />
            </div>
          </div>

          <!-- Category -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="categoryId" class="text-right">Category</Label>
            <div class="col-span-3">
              <UiVeeSelect name="categoryId" placeholder="Select category">
                <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </UiVeeSelect>
            </div>
          </div>

          <!-- Recurring Transaction -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="isRecurring" class="text-right">Recurring</Label>
            <div class="col-span-3">
              <UiVeeCheckbox name="isRecurring" label="This is a recurring transaction" />
            </div>
          </div>

          <!-- Recurrence Details (Conditional) -->
          <div v-if="values.isRecurring" class="grid grid-cols-4 items-center gap-4">
            <Label for="recurrenceInterval" class="text-right">Interval</Label>
            <div class="col-span-3">
              <UiVeeSelect name="recurrenceInterval" placeholder="Select interval">
                <option v-for="option in recurrenceIntervals" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </UiVeeSelect>
            </div>
          </div>

          <!-- Recurrence End Date (Conditional) -->
          <div v-if="values.isRecurring" class="grid grid-cols-4 items-center gap-4">
            <Label for="recurrenceEndDate" class="text-right">End Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker name="recurrenceEndDate" placeholder="Select end date (optional)" />
            </div>
          </div>

          <!-- Tags -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="tags" class="text-right">Tags</Label>
            <div class="col-span-3">
              <UiVeeTagsInput name="tags" placeholder="Add tags" />
            </div>
          </div>

          <!-- Attachments -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="attachments" class="text-right">Attachments</Label>
            <div class="col-span-3">
              <UiVeeFileInput name="attachments" accept="image/*,.pdf,.doc,.docx" multiple @change="handleFileChange" />
            </div>
          </div>
        </div>
        <div>
          {{ errors }}
        </div>

        <UiDialogFooter>
          <UiButton type="button" variant="outline" @click="$emit('update:modelValue', false)" :disabled="isLoading">
            Cancel
          </UiButton>
          <UiButton type="submit" :disabled="isLoading">
            <Icon v-if="isLoading" name="svg-spinners:ring-resize" class="mr-2 h-4 w-4" />
            {{ isLoading ? 'Saving...' : (isEditing ? 'Update Transaction' : 'Save Transaction') }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'

interface Props {
  modelValue: boolean
  categories?: Array<{
    id: string
    name: string
    color?: string
    icon?: string
    type?: string
  }>
  editingItem?: {
    id: string
    type: string
    amount: number | { toNumber: () => number }
    description?: string
    date: string | Date
    categoryId?: string
    isRecurring?: boolean
    recurrenceInterval?: string
    recurrenceEndDate?: string | Date
    tags?: string[]
    attachments?: any[]
  } | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

// State
const isLoading = ref(false)
const isEditing = computed(() => !!props.editingItem)

// Form schema
const formSchema = toTypedSchema(z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'INVESTMENT', 'DEBT_PAYMENT', 'ASSET_PURCHASE', 'ASSET_SALE']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.date(),
  categoryId: z.string().optional(),
  isRecurring: z.boolean(),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrenceEndDate: z.date().optional(),
  tags: z.array(z.string()),
  attachments: z.array(z.instanceof(File))
}).refine((data) => {
  if (data.isRecurring && !data.recurrenceInterval) return false
  if (data.recurrenceEndDate && data.recurrenceEndDate <= data.date) return false
  return true
}, {
  message: "Recurring transactions must have an interval and valid end date",
  path: ["recurrenceInterval"]
}))

// Form setup
const { handleSubmit, values, resetForm, setValues, errors } = useForm({
  validationSchema: formSchema,
  initialValues: {
    type: 'EXPENSE',
    amount: 0,
    date: new Date(),
    isRecurring: false,
    tags: [],
    attachments: []
  }
})

// Options
const transactionTypes = [
  { label: 'Income', value: 'INCOME' },
  { label: 'Expense', value: 'EXPENSE' },
  { label: 'Investment', value: 'INVESTMENT' },
  { label: 'Debt Payment', value: 'DEBT_PAYMENT' },
  { label: 'Asset Purchase', value: 'ASSET_PURCHASE' },
  { label: 'Asset Sale', value: 'ASSET_SALE' }
]

const recurrenceIntervals = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' }
]

// Computed category options
const categoryOptions = computed(() => {
  if (!props.categories || props.categories.length === 0) return []
  return props.categories.map(category => ({
    label: category.name,
    value: category.id
  }))
})

// File handling
const handleFileChange = (files?: File | FileList | File[] | null) => {
  const fileArray = files ? (Array.isArray(files) ? files : files instanceof FileList ? Array.from(files) : [files]) : []
  console.log('Files selected:', fileArray)
}

// Populate form when editing
watch(() => props.editingItem, (item) => {
  if (item) {
    const amountValue = typeof item.amount === 'object' && 'toNumber' in item.amount 
      ? item.amount.toNumber() 
      : Number(item.amount)
    
    setValues({
      type: item.type as 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'DEBT_PAYMENT' | 'ASSET_PURCHASE' | 'ASSET_SALE',
      amount: amountValue,
      description: item.description || '',
      date: item.date instanceof Date ? item.date : new Date(item.date),
      categoryId: item.categoryId || '',
      isRecurring: item.isRecurring || false,
      recurrenceInterval: item.recurrenceInterval as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
      recurrenceEndDate: item.recurrenceEndDate 
        ? (item.recurrenceEndDate instanceof Date ? item.recurrenceEndDate : new Date(item.recurrenceEndDate))
        : undefined,
      tags: item.tags || [],
      attachments: item.attachments || []
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// Form submission
const onSubmit = handleSubmit(async (formData) => {
  isLoading.value = true
  
  try {
    // Get auth headers
    const { $supabase } = useNuxtApp()
    let { data: { session } } = await ($supabase as any).auth.getSession()
    
    if (!session?.access_token) {
      toast.error('Please login to continue')
      throw new Error('No authentication token available')
    }
    
    // Check if token is expired and try to refresh
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      try {
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await ($supabase as any).auth.refreshSession()
        if (refreshError || !refreshData.session) {
          toast.error('Session expired. Please login again.')
          throw new Error('Session expired')
        }
        session = refreshData.session
      } catch (refreshError) {
        toast.error('Session expired. Please login again.')
        throw new Error('Session expired')
      }
    }
    
    const headers = {
      'Authorization': `Bearer ${session.access_token}`
    }
    
    // Prepare clean data
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== undefined && v !== '')
    )
    
    // Handle category ID
    if (cleanData.categoryId === '') {
      delete cleanData.categoryId
    }
    
    // Handle recurring data
    if (!cleanData.isRecurring) {
      delete cleanData.recurrenceInterval
      delete cleanData.recurrenceEndDate
    }
    
    let response
    
    if (isEditing.value && props.editingItem?.id) {
      // Update existing transaction
      response = await $fetch(`/api/finance/transactions/${props.editingItem.id}`, {
        method: 'PATCH',
        headers,
        body: {
          ...cleanData,
          date: cleanData.date instanceof Date ? cleanData.date.toISOString() : cleanData.date,
          recurrenceEndDate: cleanData.recurrenceEndDate instanceof Date ? cleanData.recurrenceEndDate.toISOString() : cleanData.recurrenceEndDate
        }
      })
      toast.success('Transaction updated successfully')
    } else {
      // Create new transaction
      response = await $fetch('/api/finance/transactions', {
        method: 'POST',
        headers,
        body: {
          ...cleanData,
          date: cleanData.date instanceof Date ? cleanData.date.toISOString() : cleanData.date,
          recurrenceEndDate: cleanData.recurrenceEndDate instanceof Date ? cleanData.recurrenceEndDate.toISOString() : cleanData.recurrenceEndDate
        }
      })
      toast.success('Transaction created successfully')
    }
    
    // Close modal and emit success
    emit('update:modelValue', false)
    emit('success', response)
    
  } catch (error) {
    console.error('Error saving transaction:', error)
    
    if (error instanceof Error && 'status' in error && error.status === 400) {
      toast.error((error as any).data?.message || 'Invalid data provided')
    } else if ((error as any).data?.message === 401) {
      toast.error('Please login to continue')
    } else if ((error as any).data?.message === 404) {
      toast.error('Transaction not found')
    } else {
      toast.error('Failed to save transaction. Please try again.')
    }
    
    throw error
  } finally {
    isLoading.value = false
  }
})

// Reset form when modal closes
watch(() => props.modelValue, (open) => {
  if (!open && !isEditing.value) {
    resetForm()
  }
})
</script>

