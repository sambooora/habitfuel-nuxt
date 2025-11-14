<template>
  <UiDialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <UiDialogContent class="sm:max-w-[600px]">
      <UiDialogHeader>
        <UiDialogTitle>Add New Debt</UiDialogTitle>
        <UiDialogDescription>
          Record a new debt. Fill in the details below.
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <!-- Lender Name -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="lenderName" class="text-right">Lender Name</Label>
            <div class="col-span-3">
              <UiVeeInput
                name="lenderName"
                placeholder="Enter lender name"
              />
            </div>
          </div>

          <!-- Principal Amount -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="principalAmount" class="text-right">Principal Amount</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput
                name="principalAmount"
                placeholder="Enter principal amount"
                :options="{
                  currency: 'IDR',
                  currencyDisplay: 'symbol'
                }"
              />
            </div>
          </div>

          <!-- Interest Rate -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="interestRate" class="text-right">Interest Rate (%)</Label>
            <div class="col-span-3">
              <UiVeeNumberField
                name="interestRate"
                placeholder="Enter annual interest rate"
                :step="0.01"
                :min="0"
                :max="100"
              />
            </div>
          </div>

          <!-- Current Balance -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="currentBalance" class="text-right">Current Balance</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput
                name="currentBalance"
                placeholder="Enter current balance"
                :options="{
                  currency: 'IDR',
                  currencyDisplay: 'symbol'
                }"
              />
            </div>
          </div>

          <!-- Monthly Payment -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="monthlyPayment" class="text-right">Monthly Payment</Label>
            <div class="col-span-3">
              <UiVeeCurrencyInput
                name="monthlyPayment"
                placeholder="Enter monthly payment amount"
                :options="{
                  currency: 'IDR',
                  currencyDisplay: 'symbol'
                }"
              />
            </div>
          </div>

          <!-- Start Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="startDate" class="text-right">Start Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker
                name="startDate"
                placeholder="Select start date"
              />
            </div>
          </div>

          <!-- Due Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="dueDate" class="text-right">Due Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker
                name="dueDate"
                placeholder="Select due date (optional)"
              />
            </div>
          </div>

          <!-- Next Payment Date -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="nextPaymentDate" class="text-right">Next Payment Date</Label>
            <div class="col-span-3">
              <UiVeeDatepicker
                name="nextPaymentDate"
                placeholder="Select next payment date (optional)"
              />
            </div>
          </div>

          <!-- Collateral -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="collateral" class="text-right">Collateral</Label>
            <div class="col-span-3">
              <UiVeeInput
                name="collateral"
                placeholder="Enter collateral description (optional)"
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
            {{ isSubmitting ? 'Saving...' : 'Save Debt' }}
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
  lenderName: z.string().min(1, 'Lender name is required'),
  principalAmount: z.number().positive('Principal amount must be positive'),
  interestRate: z.number().min(0).max(100).optional(),
  currentBalance: z.number().positive('Current balance must be positive'),
  monthlyPayment: z.number().positive('Monthly payment must be positive').optional(),
  startDate: z.date(),
  dueDate: z.date().optional(),
  nextPaymentDate: z.date().optional(),
  collateral: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string())
}).refine((data) => {
  if (data.dueDate && data.dueDate <= data.startDate) {
    return false
  }
  if (data.nextPaymentDate && data.nextPaymentDate < data.startDate) {
    return false
  }
  return true
}, {
  message: "Due date and next payment date must be after start date",
  path: ["dueDate"]
}))

// Form setup
const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    lenderName: '',
    principalAmount: 0,
    interestRate: 0,
    currentBalance: 0,
    monthlyPayment: 0,
    startDate: new Date(),
    dueDate: undefined,
    nextPaymentDate: undefined,
    collateral: '',
    notes: '',
    tags: []
  }
})

// Methods
const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = {
      ...values,
      interestRate: values.interestRate || undefined,
      monthlyPayment: values.monthlyPayment || undefined,
      dueDate: values.dueDate || undefined,
      nextPaymentDate: values.nextPaymentDate || undefined,
      collateral: values.collateral || undefined,
      notes: values.notes || undefined
    }
    
    emit('save', formData)
  } catch (error) {
    console.error('Error saving debt:', error)
    toast.error('Failed to save debt')
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