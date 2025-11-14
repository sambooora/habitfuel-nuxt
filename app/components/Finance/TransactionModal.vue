<script setup lang="ts">
import { computed } from 'vue'
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
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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
  if (data.isRecurring && !data.recurrenceInterval) {
    return false
  }
  if (data.recurrenceEndDate && data.recurrenceEndDate <= data.date) {
    return false
  }
  return true
}, {
  message: "Recurring transactions must have an interval and valid end date",
  path: ["recurrenceInterval"]
}))

// Form setup
const { handleSubmit, isSubmitting, values } = useForm({
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
const transactionTypeOptions = [
  { label: 'Income', value: 'INCOME' },
  { label: 'Expense', value: 'EXPENSE' },
  { label: 'Investment', value: 'INVESTMENT' },
  { label: 'Debt Payment', value: 'DEBT_PAYMENT' },
  { label: 'Asset Purchase', value: 'ASSET_PURCHASE' },
  { label: 'Asset Sale', value: 'ASSET_SALE' }
]

const recurrenceIntervalOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' }
]

// Computed category options from prop
const categoryOptions = computed(() => {
  if (!props.categories || props.categories.length === 0) {
    return []
  }
  return props.categories.map(category => ({
    label: category.name,
    value: category.id
  }))
})

// Methods
const handleFileChange = (files?: File | FileList | File[] | null) => {
  const fileArray = files ? (Array.isArray(files) ? files : files instanceof FileList ? Array.from(files) : [files]) : []
  // Handle file upload logic here
  console.log('Files selected:', fileArray)
}

const onSubmit = handleSubmit(async (values) => {
  try {
    // Validate required fields
    if (!values.type) {
      toast.error('Please select a transaction type')
      return
    }
    
    if (!values.amount || values.amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    // Convert amount from cents to main currency unit if needed
    // Currency input might return a string, convert to number
    const numericAmount = typeof values.amount === 'string' 
      ? parseFloat((values.amount as string).replace(/[^\d.-]/g, '')) / 100 // Remove currency symbols and convert from cents
      : parseFloat(values.amount.toString())
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    // Convert categoryId to proper format (UUID or undefined)
    // If categoryId is a simple string like "2", we need to handle it properly
    const categoryId = values.categoryId 
      ? (values.categoryId.includes('-') ? values.categoryId : values.categoryId)
      : undefined
    
    const formData = {
      ...values,
      amount: numericAmount,
      categoryId: categoryId,
      recurrenceInterval: values.isRecurring ? values.recurrenceInterval : undefined,
      recurrenceEndDate: values.isRecurring ? values.recurrenceEndDate : undefined,
      date: values.date.toISOString(), // Convert date to ISO string for backend
      tags: values.tags || [],
      attachments: values.attachments || []
    }
    
    console.log('Submitting transaction data:', formData)
    emit('save', formData)
    
    // Show success message (parent component will handle actual success)
    toast.success('Transaction submitted successfully')
  } catch (error) {
    console.error('Error saving transaction:', error)
    toast.error('Failed to save transaction. Please check your input and try again.')
    throw error // Re-throw to prevent modal from closing
  }
})

// Watch for modal close to reset form
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    // Reset form when modal closes
    // This would be handled by the form library
  }
})
</script>
<template>
  <UiDialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <UiDialogContent class="sm:max-w-[600px]">
      <UiDialogHeader>
        <UiDialogTitle>Add New Transaction</UiDialogTitle>
        <UiDialogDescription>
          Record a new financial transaction. Fill in the details below.
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <!-- Transaction Type -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="type" class="text-right">Type</Label>
            <div class="col-span-3">
              <UiVeeSelect
                name="type"
                placeholder="Select transaction type"
              >
                <option v-for="option in transactionTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </UiVeeSelect>
            </div>
          </div>

          <!-- Amount -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="amount" class="text-right">Amount</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput
                name="amount"
                placeholder="Enter amount"
                :options="{
                  currency: 'IDR',
                }"
              />
            </div>
          </div>

          <!-- Description -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="description" class="text-right">Description</Label>
            <div class="col-span-3">
              <UiVeeTextarea
                name="description"
                placeholder="Enter description"
                :rows="2"
              />
            </div>
          </div>

          <!-- Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="date" class="text-right">Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker
                name="date"
                placeholder="Select date"
              />
            </div>
          </div>

          <!-- Category -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="categoryId" class="text-right">Category</Label>
            <div class="col-span-3">
              <UiVeeSelect
                name="categoryId"
                placeholder="Select category"
              >
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
              <UiVeeCheckbox
                name="isRecurring"
                label="This is a recurring transaction"
              />
            </div>
          </div>

          <!-- Recurrence Details (Conditional) -->
          <div v-if="values.isRecurring" class="grid grid-cols-4 items-center gap-4">
            <Label for="recurrenceInterval" class="text-right">Interval</Label>
            <div class="col-span-3">
              <UiVeeSelect
                name="recurrenceInterval"
                placeholder="Select interval"
              >
                <option v-for="option in recurrenceIntervalOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </UiVeeSelect>
            </div>
          </div>

          <!-- Recurrence End Date (Conditional) -->
          <div v-if="values.isRecurring" class="grid grid-cols-4 items-center gap-4">
            <Label for="recurrenceEndDate" class="text-right">End Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker
                name="recurrenceEndDate"
                placeholder="Select end date (optional)"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="tags" class="text-right">Tags</Label>
            <div class="col-span-3">
              <UiVeeTagsInput
                name="tags"
                placeholder="Add tags"
              />
            </div>
          </div>

          <!-- Attachments -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="attachments" class="text-right">Attachments</Label>
            <div class="col-span-3">
              <UiVeeFileInput
                name="attachments"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                @change="handleFileChange"
              />
            </div>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton type="button" variant="outline" @click="$emit('update:modelValue', false)">
            Cancel
          </UiButton>
          <UiButton type="submit" :disabled="isSubmitting">
            <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="mr-2 h-4 w-4" />
            {{ isSubmitting ? 'Saving...' : 'Save Transaction' }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>

