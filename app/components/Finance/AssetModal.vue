<template>
  <UiDialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <UiDialogContent class="sm:max-w-[600px]">
      <UiDialogHeader>
        <UiDialogTitle>{{ modalTitle }}</UiDialogTitle>
        <UiDialogDescription>
          {{ modalDescription }}
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
                :rows="2"
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
                :rows="3"
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
          <UiButton type="button" variant="outline" @click="$emit('update:modelValue', false)" :disabled="isLoading">
            Cancel
          </UiButton>
          <UiButton type="submit" :disabled="isLoading">
            <Icon v-if="isLoading" name="svg-spinners:ring-resize" class="mr-2 h-4 w-4" />
            {{ isLoading ? 'Saving...' : (isEditing ? 'Update Asset' : 'Save Asset') }}
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
    type: string
    name: string
    description?: string
    purchasePrice: number | { toNumber: () => number }
    currentValue?: number | { toNumber: () => number }
    purchaseDate: string | Date
    depreciationRate?: number | { toNumber: () => number }
    location?: string
    serialNumber?: string
    warrantyExpiry?: string | Date
    insuranceInfo?: string
    notes?: string
    tags?: string[]
    attachments?: any[]
  } | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isLoading = ref(false)

// Computed properties for dynamic modal titles
const isEditing = computed(() => !!props.editingItem)
const modalTitle = computed(() => isEditing.value ? 'Edit Asset' : 'Add New Asset')
const modalDescription = computed(() => isEditing.value ? 'Update asset details below.' : 'Record a new asset. Fill in the details below.')

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
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.instanceof(File)).optional()
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
const { handleSubmit, values, resetForm, setValues } = useForm({
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

// Helper function to convert amount values
const convertAmount = (value: number | { toNumber: () => number } | undefined): number => {
  if (value === undefined || value === null) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'toNumber' in value) return value.toNumber()
  return 0
}

// Methods
const handleFileChange = (files?: File | FileList | File[] | null) => {
  const fileArray = files ? (Array.isArray(files) ? files : files instanceof FileList ? Array.from(files) : [files]) : []
  // Handle file upload logic here
  console.log('Files selected:', fileArray)
}

const onSubmit = handleSubmit(async (values) => {
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
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
    
    const formData = {
      type: values.type,
      name: values.name,
      description: values.description || undefined,
      purchasePrice: values.purchasePrice,
      currentValue: values.currentValue || undefined,
      purchaseDate: values.purchaseDate,
      depreciationRate: values.depreciationRate || undefined,
      location: values.location || undefined,
      serialNumber: values.serialNumber || undefined,
      warrantyExpiry: values.warrantyExpiry || undefined,
      insuranceInfo: values.insuranceInfo || undefined,
      notes: values.notes || undefined
    }
    
    // Clean up data for API - remove undefined values and ensure proper number conversion
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== undefined && v !== '')
    )
    delete (cleanData as any).attachments
    delete (cleanData as any).tags
    
    // Ensure numeric fields are properly converted to numbers
    const numericFields = ['purchasePrice', 'currentValue', 'depreciationRate']
    numericFields.forEach(field => {
      if (cleanData[field] !== undefined && cleanData[field] !== null) {
        const value = cleanData[field]
        if (typeof value === 'string') {
          // Remove currency formatting and convert to number
          cleanData[field] = Number(value.replace(/[^\d.-]/g, ''))
        } else if (typeof value === 'number') {
          // Already a number, keep it
          cleanData[field] = value
        } else if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
          // Handle objects with toNumber method
          cleanData[field] = value.toNumber()
        }
      }
    })
    
    let response
    
    if (isEditing.value && props.editingItem?.id) {
      // Update existing asset
      response = await $fetch(`/api/finance/assets/${props.editingItem.id}`, {
        method: 'PATCH',
        headers,
        body: {
          ...cleanData,
          purchaseDate: cleanData.purchaseDate instanceof Date ? cleanData.purchaseDate.toISOString() : cleanData.purchaseDate,
          warrantyExpiry: cleanData.warrantyExpiry instanceof Date ? cleanData.warrantyExpiry.toISOString() : cleanData.warrantyExpiry
        }
      })
      toast.success('Asset updated successfully')
    } else {
      // Create new asset
      response = await $fetch('/api/finance/assets', {
        method: 'POST',
        headers,
        body: {
          ...cleanData,
          purchaseDate: cleanData.purchaseDate instanceof Date ? cleanData.purchaseDate.toISOString() : cleanData.purchaseDate,
          warrantyExpiry: cleanData.warrantyExpiry instanceof Date ? cleanData.warrantyExpiry.toISOString() : cleanData.warrantyExpiry
        }
      })
      toast.success('Asset created successfully')
    }
    
    // Close modal and emit success
    emit('update:modelValue', false)
    emit('success', response)
    
  } catch (error) {
    console.error('Error saving asset:', error)
    
    if ((error as any).status === 400) {
      toast.error((error as any).data?.message || 'Invalid data provided')
    } else if ((error as any).status === 401) {
      toast.error('Please login to continue')
    } else if ((error as any).status === 404) {
      toast.error('Asset not found')
    } else if ((error as any).status === 429) {
      toast.error('Too many requests. Please try again later.')
    } else {
      toast.error('Failed to save asset. Please try again.')
    }
    
    throw error
  } finally {
    isLoading.value = false
  }
})

// Watch for editing item changes to populate form
watch(() => props.editingItem, (newEditingItem) => {
  if (newEditingItem) {
    setValues({
      type: newEditingItem.type as 'REAL_ESTATE' | 'VEHICLE' | 'INVESTMENT' | 'CASH' | 'BANK_ACCOUNT' | 'DIGITAL_ASSET' | 'PRECIOUS_METAL' | 'OTHER',
      name: newEditingItem.name,
      description: newEditingItem.description || '',
      purchasePrice: convertAmount(newEditingItem.purchasePrice),
      currentValue: convertAmount(newEditingItem.currentValue) || 0,
      purchaseDate: new Date(newEditingItem.purchaseDate),
      depreciationRate: convertAmount(newEditingItem.depreciationRate) || 0,
      location: newEditingItem.location || '',
      serialNumber: newEditingItem.serialNumber || '',
      warrantyExpiry: newEditingItem.warrantyExpiry ? new Date(newEditingItem.warrantyExpiry) : undefined,
      insuranceInfo: newEditingItem.insuranceInfo || '',
      notes: newEditingItem.notes || '',
      tags: newEditingItem.tags || [],
      attachments: []
    })
  } else if (!props.modelValue) {
    // Reset form when not editing and modal is closed
    resetForm()
  }
}, { immediate: true })

// Watch for modal close to reset form
watch(() => props.modelValue, (newValue) => {
  if (!newValue && !isEditing.value) {
    // Reset form when modal closes and not in editing mode
    resetForm()
  }
})
</script>