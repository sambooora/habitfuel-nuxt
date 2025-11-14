<template>
  <UiDialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <UiDialogContent class="sm:max-w-[600px]">
      <UiDialogHeader>
        <UiDialogTitle>Add New Asset</UiDialogTitle>
        <UiDialogDescription>
          Record a new asset. Fill in the details below.
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <!-- Asset Type -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="type" class="text-right">Type</Label>
            <div class="col-span-3">
              <UiVeeSelect
                name="type"
                placeholder="Select asset type"
              >
                <option v-for="option in assetTypeOptions" :key="option.value" :value="option.value">
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
                placeholder="Enter asset name"
              />
            </div>
          </div>

          <!-- Description -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="description" class="text-right">Description</Label>
            <div class="col-span-3">
              <UiVeeTextarea
                name="description"
                placeholder="Enter description (optional)"
                rows="2"
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

          <!-- Depreciation Rate -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="depreciationRate" class="text-right">Depreciation Rate (%)</Label>
            <div class="col-span-3">
              <UiVeeNumberField
                name="depreciationRate"
                placeholder="Enter annual depreciation rate"
                :step="0.01"
                :min="0"
                :max="100"
              />
            </div>
          </div>

          <!-- Location -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="location" class="text-right">Location</Label>
            <div class="col-span-3">
              <UiVeeInput
                name="location"
                placeholder="Enter location (optional)"
              />
            </div>
          </div>

          <!-- Serial Number -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="serialNumber" class="text-right">Serial Number</Label>
            <div class="col-span-3">
              <UiVeeInput
                name="serialNumber"
                placeholder="Enter serial number (optional)"
              />
            </div>
          </div>

          <!-- Warranty Expiry -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="warrantyExpiry" class="text-right">Warranty Expiry</Label>
            <div class="col-span-3">
              <UiVeeDatepicker
                name="warrantyExpiry"
                placeholder="Select warranty expiry date (optional)"
              />
            </div>
          </div>

          <!-- Insurance Info -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="insuranceInfo" class="text-right">Insurance Info</Label>
            <div class="col-span-3">
              <UiVeeInput
                name="insuranceInfo"
                placeholder="Enter insurance information (optional)"
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
            {{ isSubmitting ? 'Saving...' : 'Save Asset' }}
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
  type: z.enum(['REAL_ESTATE', 'VEHICLE', 'INVESTMENT', 'CASH', 'BANK_ACCOUNT', 'DIGITAL_ASSET', 'PRECIOUS_METAL', 'OTHER']),
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  currentValue: z.number().positive('Current value must be positive').optional(),
  purchaseDate: z.date(),
  depreciationRate: z.number().min(0).max(100).optional(),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  warrantyExpiry: z.date().optional(),
  insuranceInfo: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()),
  attachments: z.array(z.instanceof(File))
}).refine((data) => {
  if (data.currentValue && data.currentValue <= 0) {
    return false
  }
  if (data.warrantyExpiry && data.warrantyExpiry <= data.purchaseDate) {
    return false
  }
  return true
}, {
  message: "Warranty expiry must be after purchase date",
  path: ["warrantyExpiry"]
}))

// Form setup
const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    type: 'OTHER',
    name: '',
    description: '',
    purchasePrice: 0,
    currentValue: 0,
    purchaseDate: new Date(),
    depreciationRate: 0,
    location: '',
    serialNumber: '',
    warrantyExpiry: undefined,
    insuranceInfo: '',
    notes: '',
    tags: [],
    attachments: []
  }
})

// Options
const assetTypeOptions = [
  { label: 'Real Estate', value: 'REAL_ESTATE' },
  { label: 'Vehicle', value: 'VEHICLE' },
  { label: 'Investment', value: 'INVESTMENT' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank Account', value: 'BANK_ACCOUNT' },
  { label: 'Digital Asset', value: 'DIGITAL_ASSET' },
  { label: 'Precious Metal', value: 'PRECIOUS_METAL' },
  { label: 'Other', value: 'OTHER' }
]

// Methods
const handleFileChange = (files?: File | FileList | File[] | null) => {
  const fileArray = files ? (Array.isArray(files) ? files : files instanceof FileList ? Array.from(files) : [files]) : []
  // Handle file upload logic here
  console.log('Files selected:', fileArray)
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const formData = {
      ...values,
      currentValue: values.currentValue || undefined,
      depreciationRate: values.depreciationRate || undefined,
      location: values.location || undefined,
      serialNumber: values.serialNumber || undefined,
      warrantyExpiry: values.warrantyExpiry || undefined,
      insuranceInfo: values.insuranceInfo || undefined,
      notes: values.notes || undefined
    }
    
    emit('save', formData)
  } catch (error) {
    console.error('Error saving asset:', error)
    toast.error('Failed to save asset')
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