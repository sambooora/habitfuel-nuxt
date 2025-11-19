<template>
  <UiDialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <UiDialogContent class="sm:max-w-[600px]">
      <UiDialogHeader>
        <UiDialogTitle>{{ isEditing ? 'Edit Debt' : 'Add New Debt' }}</UiDialogTitle>
        <UiDialogDescription>
          {{ isEditing ? 'Update the debt details below.' : 'Record a new debt. Fill in the details below.' }}
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <!-- Lender Name -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="lenderName" class="text-right">Lender Name</Label>
            <div class="col-span-3">
              <UiVeeInput name="lenderName" placeholder="Enter lender name" />
            </div>
          </div>

          <!-- Principal Amount -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="principalAmount" class="text-right">Principal Amount</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput name="principalAmount" placeholder="Enter principal amount" :options="{ currency: 'IDR' }" />
            </div>
          </div>

          <!-- Interest Rate -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="interestRate" class="text-right">Interest Rate (%)</Label>
            <div class="col-span-3">
              <UiVeeNumberField name="interestRate" placeholder="Enter annual interest rate" :step="0.01" :min="0" :max="100" />
            </div>
          </div>

          <!-- Current Balance -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="currentBalance" class="text-right">Current Balance</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput name="currentBalance" placeholder="Enter current balance" :options="{ currency: 'IDR' }" />
            </div>
          </div>

          <!-- Monthly Payment -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="monthlyPayment" class="text-right">Monthly Payment</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput name="monthlyPayment" placeholder="Enter monthly payment" :options="{ currency: 'IDR' }" />
            </div>
          </div>

          <!-- Status -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="status" class="text-right">Status</Label>
            <div class="col-span-3">
              <UiVeeSelect name="status" placeholder="Select status">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </UiVeeSelect>
            </div>
          </div>

          <!-- Start Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="startDate" class="text-right">Start Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker name="startDate" placeholder="Select start date" />
            </div>
          </div>

          <!-- Due Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="dueDate" class="text-right">Due Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker name="dueDate" placeholder="Select due date (optional)" />
            </div>
          </div>

          <!-- Next Payment Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="nextPaymentDate" class="text-right">Next Payment Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker name="nextPaymentDate" placeholder="Select next payment date (optional)" />
            </div>
          </div>

          <!-- Collateral -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="collateral" class="text-right">Collateral</Label>
            <div class="col-span-3">
              <UiVeeInput name="collateral" placeholder="Enter collateral (optional)" />
            </div>
          </div>

          <!-- Notes -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="notes" class="text-right">Notes</Label>
            <div class="col-span-3">
              <UiVeeTextarea name="notes" placeholder="Enter notes (optional)" :rows="3" />
            </div>
          </div>

          <!-- Tags -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="tags" class="text-right">Tags</Label>
            <div class="col-span-3">
              <UiVeeTagsInput name="tags" placeholder="Add tags" />
            </div>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton type="button" variant="outline" @click="$emit('update:modelValue', false)" :disabled="isLoading">
            Cancel
          </UiButton>
          <UiButton type="submit" :disabled="isLoading">
            <Icon v-if="isLoading" name="svg-spinners:ring-resize" class="mr-2 h-4 w-4" />
            {{ isLoading ? 'Saving...' : (isEditing ? 'Update Debt' : 'Save Debt') }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'

interface Props {
  modelValue: boolean
  editingItem?: {
    id: string
    lenderName: string
    principalAmount: number | { toNumber: () => number }
    currentBalance: number | { toNumber: () => number }
    interestRate?: number | { toNumber: () => number }
    monthlyPayment?: number | { toNumber: () => number }
    status: 'ACTIVE' | 'PAID' | 'OVERDUE' | 'DEFAULTED'
    startDate: string
    dueDate?: string
    nextPaymentDate?: string
    collateral?: string
    notes?: string
    tags?: string[]
  } | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

// State
const isLoading = ref(false)
const isEditing = computed(() => !!props.editingItem)

// Form schema
const formSchema = toTypedSchema(z.object({
  lenderName: z.string().min(1, 'Lender name is required'),
  principalAmount: z.number().positive('Principal amount must be positive'),
  currentBalance: z.number().positive('Current balance must be positive'),
  interestRate: z.number().min(0).max(100).optional(),
  monthlyPayment: z.number().positive('Monthly payment must be positive').optional(),
  status: z.enum(['ACTIVE', 'PAID', 'OVERDUE', 'DEFAULTED']),
  startDate: z.date(),
  dueDate: z.date().optional(),
  nextPaymentDate: z.date().optional(),
  collateral: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string())
}))

// Form setup
const { handleSubmit, values, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    lenderName: '',
    principalAmount: 0,
    currentBalance: 0,
    interestRate: 0,
    monthlyPayment: 0,
    status: 'ACTIVE',
    startDate: new Date(),
    dueDate: undefined,
    nextPaymentDate: undefined,
    collateral: '',
    notes: '',
    tags: []
  }
})

// Status options
const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Defaulted', value: 'DEFAULTED' }
]

// Populate form when editing
watch(() => props.editingItem, (item) => {
  if (item) {
    const principalAmountValue = typeof item.principalAmount === 'object' && 'toNumber' in item.principalAmount 
      ? item.principalAmount.toNumber() 
      : Number(item.principalAmount)
    
    const currentBalanceValue = typeof item.currentBalance === 'object' && 'toNumber' in item.currentBalance 
      ? item.currentBalance.toNumber() 
      : Number(item.currentBalance)
    
    const interestRateValue = item.interestRate 
      ? (typeof item.interestRate === 'object' && 'toNumber' in item.interestRate 
        ? item.interestRate.toNumber() 
        : Number(item.interestRate))
      : 0
    
    const monthlyPaymentValue = item.monthlyPayment 
      ? (typeof item.monthlyPayment === 'object' && 'toNumber' in item.monthlyPayment 
        ? item.monthlyPayment.toNumber() 
        : Number(item.monthlyPayment))
      : 0
    
    setValues({
      lenderName: item.lenderName,
      principalAmount: principalAmountValue,
      currentBalance: currentBalanceValue,
      interestRate: interestRateValue,
      monthlyPayment: monthlyPaymentValue,
      status: item.status,
      startDate: item.startDate ? new Date(item.startDate) : new Date(),
      dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      nextPaymentDate: item.nextPaymentDate ? new Date(item.nextPaymentDate) : undefined,
      collateral: item.collateral || '',
      notes: item.notes || '',
      tags: item.tags || []
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
    
    // Prepare clean data and ensure proper number conversion
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== undefined && v !== '')
    )
    
    // Ensure numeric fields are properly converted to numbers
    const numericFields = ['principalAmount', 'currentBalance', 'interestRate', 'monthlyPayment']
    numericFields.forEach(field => {
      if (cleanData[field] !== undefined && cleanData[field] !== null) {
        const value = cleanData[field]
        if (typeof value === 'string') {
          // Remove currency formatting and convert to number
          cleanData[field] = Number(value.replace(/[^\d.-]/g, ''))
        } else if (typeof value === 'number') {
          // Already a number, keep it
          cleanData[field] = value
        } else if (value && typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date) && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
          // Handle objects with toNumber method
          cleanData[field] = (value as any).toNumber()
        }
      }
    })
    
    let response
    
    if (isEditing.value && props.editingItem?.id) {
      // Update existing debt
      response = await $fetch(`/api/finance/debts/${props.editingItem.id}`, {
        method: 'PATCH',
        headers,
        body: {
          ...cleanData,
          startDate: cleanData.startDate instanceof Date ? cleanData.startDate.toISOString() : cleanData.startDate,
          dueDate: cleanData.dueDate instanceof Date ? cleanData.dueDate.toISOString() : cleanData.dueDate,
          nextPaymentDate: cleanData.nextPaymentDate instanceof Date ? cleanData.nextPaymentDate.toISOString() : cleanData.nextPaymentDate
        }
      })
      toast.success('Debt updated successfully')
    } else {
      // Create new debt
      response = await $fetch('/api/finance/debts', {
        method: 'POST',
        headers,
        body: {
          ...cleanData,
          startDate: cleanData.startDate instanceof Date ? cleanData.startDate.toISOString() : cleanData.startDate,
          dueDate: cleanData.dueDate instanceof Date ? cleanData.dueDate.toISOString() : cleanData.dueDate,
          nextPaymentDate: cleanData.nextPaymentDate instanceof Date ? cleanData.nextPaymentDate.toISOString() : cleanData.nextPaymentDate
        }
      })
      toast.success('Debt created successfully')
    }
    
    // Close modal and emit success
    emit('update:modelValue', false)
    emit('success', response)
    
  } catch (error) {
    console.error('Error saving debt:', error)
    
    if ((error as any).status === 400) {
      toast.error((error as any).data?.message || 'Invalid data provided')
    } else if ((error as any).status === 401) {
      toast.error('Please login to continue')
    } else if ((error as any).status === 404) {
      toast.error('Debt not found')
    } else {
      toast.error('Failed to save debt. Please try again.')
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