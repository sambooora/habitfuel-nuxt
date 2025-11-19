<template>
  <UiDialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <UiDialogContent class="sm:max-w-[600px]">
      <UiDialogHeader>
        <UiDialogTitle>{{ isEditing ? 'Edit Investment' : 'Add New Investment' }}</UiDialogTitle>
        <UiDialogDescription>
          {{ isEditing ? 'Update the investment details below.' : 'Record a new investment. Fill in the details below.' }}
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <!-- Investment Type -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="type" class="text-right">Type</Label>
            <div class="col-span-3">
              <UiVeeSelect name="type" placeholder="Select investment type">
                <option v-for="option in investmentTypes" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </UiVeeSelect>
            </div>
          </div>

          <!-- Name -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <div class="col-span-3">
              <UiVeeInput name="name" placeholder="Enter investment name" />
            </div>
          </div>

          <!-- Symbol -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="symbol" class="text-right">Symbol</Label>
            <div class="col-span-3">
              <UiVeeInput name="symbol" placeholder="e.g., AAPL, BTC (optional)" />
            </div>
          </div>

          <!-- Quantity -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="quantity" class="text-right">Quantity</Label>
            <div class="col-span-3">
              <UiVeeNumberField name="quantity" placeholder="Enter quantity" :step="0.000001" />
            </div>
          </div>

          <!-- Purchase Price -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="purchasePrice" class="text-right">Purchase Price</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput name="purchasePrice" placeholder="Enter purchase price" :options="{ currency: 'IDR' }" />
            </div>
          </div>

          <!-- Current Price -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="currentPrice" class="text-right">Current Price</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput name="currentPrice" placeholder="Enter current price (optional)" :options="{ currency: 'IDR' }" />
            </div>
          </div>

          <!-- Total Invested -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="totalInvested" class="text-right">Total Invested</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput name="totalInvested" placeholder="Enter total invested amount" :options="{ currency: 'IDR' }" />
            </div>
          </div>

          <!-- Current Value -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="currentValue" class="text-right">Current Value</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput name="currentValue" placeholder="Enter current value (optional)" :options="{ currency: 'IDR' }" />
            </div>
          </div>

          <!-- Purchase Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="purchaseDate" class="text-right">Purchase Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker name="purchaseDate" placeholder="Select purchase date" />
            </div>
          </div>

          <!-- Broker -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="broker" class="text-right">Broker</Label>
            <div class="col-span-3">
              <UiVeeInput name="broker" placeholder="Enter broker name (optional)" />
            </div>
          </div>

          <!-- Notes -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="notes" class="text-right">Notes</Label>
            <div class="col-span-3">
              <UiVeeTextarea name="notes" placeholder="Enter notes (optional)" :rows="3" />
            </div>
          </div>
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
            {{ isLoading ? 'Saving...' : (isEditing ? 'Update Investment' : 'Save Investment') }}
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
    name: string
    type: string
    totalInvested: number | { toNumber: () => number }
    currentValue?: number | { toNumber: () => number }
    purchaseDate: string | Date
    symbol?: string
    quantity?: number
    broker?: string
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
  type: z.enum(['STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'REAL_ESTATE', 'CRYPTO', 'COMMODITY', 'OTHER']),
  name: z.string().min(1, 'Investment name is required'),
  symbol: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  currentPrice: z.number().positive('Current price must be positive').optional(),
  totalInvested: z.number().positive('Total invested must be positive'),
  currentValue: z.number().positive('Current value must be positive').optional(),
  purchaseDate: z.date(),
  broker: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
}).refine((data) => {
  if (data.currentPrice && !data.currentValue) return false
  if (data.currentValue && !data.currentPrice) return false
  return true
}, {
  message: "Current price and current value must be provided together",
  path: ["currentPrice"]
}))

// Form setup
const { handleSubmit, values, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    type: 'STOCK',
    name: '',
    symbol: '',
    quantity: 0,
    purchasePrice: 0,
    currentPrice: 0,
    totalInvested: 0,
    currentValue: 0,
    purchaseDate: new Date(),
    broker: '',
    notes: '',
    tags: []
  }
})

// Investment types
const investmentTypes = [
  { label: 'Stock', value: 'STOCK' },
  { label: 'Bond', value: 'BOND' },
  { label: 'Mutual Fund', value: 'MUTUAL_FUND' },
  { label: 'ETF', value: 'ETF' },
  { label: 'Real Estate', value: 'REAL_ESTATE' },
  { label: 'Cryptocurrency', value: 'CRYPTO' },
  { label: 'Commodity', value: 'COMMODITY' },
  { label: 'Other', value: 'OTHER' }
]

// Populate form when editing
watch(() => props.editingItem, (item) => {
  if (item) {
    const totalInvestedValue = typeof item.totalInvested === 'object' && 'toNumber' in item.totalInvested 
      ? item.totalInvested.toNumber() 
      : Number(item.totalInvested)
    
    const currentValue = item.currentValue 
      ? (typeof item.currentValue === 'object' && 'toNumber' in item.currentValue 
        ? item.currentValue.toNumber() 
        : Number(item.currentValue))
      : 0
    
    const currentPrice = currentValue && item.quantity ? currentValue / item.quantity : 0
    const purchasePrice = totalInvestedValue && item.quantity ? totalInvestedValue / item.quantity : 0
    
    setValues({
      type: item.type as 'STOCK' | 'BOND' | 'MUTUAL_FUND' | 'ETF' | 'REAL_ESTATE' | 'CRYPTO' | 'COMMODITY' | 'OTHER',
      name: item.name,
      symbol: item.symbol || '',
      quantity: item.quantity || 0,
      purchasePrice: purchasePrice,
      currentPrice: currentPrice,
      totalInvested: totalInvestedValue,
      currentValue: currentValue,
      purchaseDate: item.purchaseDate instanceof Date ? item.purchaseDate : new Date(item.purchaseDate),
      broker: item.broker || '',
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
    const numericFields = ['quantity', 'purchasePrice', 'currentPrice', 'totalInvested', 'currentValue']
    numericFields.forEach(field => {
      if (cleanData[field] !== undefined && cleanData[field] !== null) {
        const value = cleanData[field]
        if (typeof value === 'string') {
          // Remove currency formatting and convert to number
          cleanData[field] = Number(value.replace(/[^\d.-]/g, ''))
        } else if (typeof value === 'number') {
          // Already a number, keep it
          cleanData[field] = value
        } else if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
          // Handle objects with toNumber method
          cleanData[field] = (value as { toNumber: () => number }).toNumber()
        }
      }
    })
    
    let response
    
    if (isEditing.value && props.editingItem?.id) {
      // Update existing investment
      response = await $fetch(`/api/finance/investments/${props.editingItem.id}`, {
        method: 'PATCH',
        headers,
        body: {
          ...cleanData,
          purchaseDate: cleanData.purchaseDate instanceof Date ? cleanData.purchaseDate.toISOString() : cleanData.purchaseDate
        }
      })
      toast.success('Investment updated successfully')
    } else {
      // Create new investment
      response = await $fetch('/api/finance/investments', {
        method: 'POST',
        headers,
        body: {
          ...cleanData,
          purchaseDate: cleanData.purchaseDate instanceof Date ? cleanData.purchaseDate.toISOString() : cleanData.purchaseDate
        }
      })
      toast.success('Investment created successfully')
    }
    
    // Close modal and emit success
    emit('update:modelValue', false)
    emit('success', response)
    
  } catch (error) {
    console.error('Error saving investment:', error)
    
    if ((error as any).status === 400) {
      toast.error((error as any).data?.message || 'Invalid data provided')
    } else if ((error as any).status === 401) {
      toast.error('Please login to continue')
    } else if ((error as any).status === 404) {
      toast.error('Investment not found')
    } else {
      toast.error('Failed to save investment. Please try again.')
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