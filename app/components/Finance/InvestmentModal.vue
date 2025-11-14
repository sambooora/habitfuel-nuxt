<template>
  <UiDialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <UiDialogContent class="sm:max-w-[600px]">
      <UiDialogHeader>
        <UiDialogTitle>Add New Investment</UiDialogTitle>
        <UiDialogDescription>
          Record a new investment. Fill in the details below.
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <!-- Investment Type -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="type" class="text-right">Type</Label>
            <div class="col-span-3">
              <UiVeeSelect
                name="type"
                placeholder="Select investment type"
              >
                <option v-for="option in investmentTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </UiVeeSelect>
            </div>
          </div>

          <!-- Name -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <div class="col-span-3">
              <UiVeeInput
                name="name"
                placeholder="Enter investment name"
              />
            </div>
          </div>

          <!-- Symbol (Conditional) -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="symbol" class="text-right">Symbol</Label>
            <div class="col-span-3">
              <UiVeeInput
                name="symbol"
                placeholder="e.g., AAPL, BTC (optional)"
              />
            </div>
          </div>

          <!-- Quantity (Conditional) -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="quantity" class="text-right">Quantity</Label>
            <div class="col-span-3">
              <UiVeeNumberField
                name="quantity"
                placeholder="Enter quantity"
                :step="0.000001"
              />
            </div>
          </div>

          <!-- Purchase Price -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="purchasePrice" class="text-right">Purchase Price</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput
                name="purchasePrice"
                placeholder="Enter purchase price"
                :options="{
                  currency: 'IDR',
                  currencyDisplay: 'symbol'
                }"
              />
            </div>
          </div>

          <!-- Current Price (Optional) -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="currentPrice" class="text-right">Current Price</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput
                name="currentPrice"
                placeholder="Enter current price (optional)"
                :options="{
                  currency: 'IDR',
                  currencyDisplay: 'symbol'
                }"
              />
            </div>
          </div>

          <!-- Total Invested -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="totalInvested" class="text-right">Total Invested</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput
                name="totalInvested"
                placeholder="Enter total invested amount"
                :options="{
                  currency: 'IDR',
                  currencyDisplay: 'symbol'
                }"
              />
            </div>
          </div>

          <!-- Current Value (Optional) -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="currentValue" class="text-right">Current Value</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput
                name="currentValue"
                placeholder="Enter current value (optional)"
                :options="{
                  currency: 'IDR',
                  currencyDisplay: 'symbol'
                }"
              />
            </div>
          </div>

          <!-- Purchase Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="purchaseDate" class="text-right">Purchase Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker
                name="purchaseDate"
                placeholder="Select purchase date"
              />
            </div>
          </div>

          <!-- Broker -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="broker" class="text-right">Broker</Label>
            <div class="col-span-3">
              <UiVeeInput
                name="broker"
                placeholder="Enter broker name (optional)"
              />
            </div>
          </div>

          <!-- Notes -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="notes" class="text-right">Notes</Label>
            <div class="col-span-3">
              <UiVeeTextarea
                name="notes"
                placeholder="Enter notes (optional)"
                rows="3"
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
        </div>

        <UiDialogFooter>
          <UiButton type="button" variant="outline" @click="$emit('update:modelValue', false)">
            Cancel
          </UiButton>
          <UiButton type="submit" :disabled="isSubmitting">
            <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="mr-2 h-4 w-4" />
            {{ isSubmitting ? 'Saving...' : 'Save Investment' }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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
  tags: z.array(z.string())
}).refine((data) => {
  // Validate that current values are provided together
  if (data.currentPrice && !data.currentValue) {
    return false
  }
  if (data.currentValue && !data.currentPrice) {
    return false
  }
  return true
}, {
  message: "Current price and current value must be provided together",
  path: ["currentPrice"]
}))

// Form setup
const { handleSubmit, isSubmitting, values } = useForm({
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

// Options
const investmentTypeOptions = [
  { label: 'Stock', value: 'STOCK' },
  { label: 'Bond', value: 'BOND' },
  { label: 'Mutual Fund', value: 'MUTUAL_FUND' },
  { label: 'ETF', value: 'ETF' },
  { label: 'Real Estate', value: 'REAL_ESTATE' },
  { label: 'Cryptocurrency', value: 'CRYPTO' },
  { label: 'Commodity', value: 'COMMODITY' },
  { label: 'Other', value: 'OTHER' }
]

// Methods
const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = {
      ...values,
      quantity: values.quantity || undefined,
      symbol: values.symbol || undefined,
      currentPrice: values.currentPrice || undefined,
      currentValue: values.currentValue || undefined,
      broker: values.broker || undefined,
      notes: values.notes || undefined
    }
    
    emit('save', formData)
  } catch (error) {
    console.error('Error saving investment:', error)
    toast.error('Failed to save investment')
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