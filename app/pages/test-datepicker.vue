<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Datepicker Component Test</h1>
    
    <div class="space-y-8">
      <!-- Basic Datepicker Test -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Basic Ui Datepicker</h2>
        <UiDatepicker
          v-model="basicDate"
          placeholder="Select a date"
          display-format="MMMM D, YYYY"
          @date-change="handleDateChange"
          @validation-error="handleValidationError"
        />
        <p class="mt-2 text-sm text-gray-600">Selected: {{ basicDate || 'No date selected' }}</p>
      </div>

      <!-- Vee Datepicker Test -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Vee Datepicker with Validation</h2>
        <form @submit.prevent="handleSubmit">
          <UiVeeDatepicker
            v-model="veeDate"
            name="testDate"
            label="Test Date"
            placeholder="Select a date"
            display-format="MMMM D, YYYY"
            :disable-past-dates="true"
            :disable-weekends="false"
            :rules="dateRules"
            required
            @date-change="handleVeeDateChange"
          />
          <button 
            type="submit" 
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
        <p class="mt-2 text-sm text-gray-600">Vee Selected: {{ veeDate || 'No date selected' }}</p>
      </div>

      <!-- Multiple Date Selection Test -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Multiple Date Selection</h2>
        <UiDatepicker
          v-model="multipleDates"
          multiple
          placeholder="Select multiple dates"
          display-format="MMM D"
          range-separator=" | "
          @date-change="handleMultipleDateChange"
        />
        <p class="mt-2 text-sm text-gray-600">
          Selected: {{ multipleDates.length > 0 ? multipleDates.map(d => d.toISOString()).join(', ') : 'No dates selected' }}
        </p>
      </div>

      <!-- Date Range Test -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Date Range Selection</h2>
        <UiDatepicker
          v-model="dateRange"
          :multiple="true"
          :range-mode="true"
          placeholder="Select date range"
          display-format="MMM D, YYYY"
          :min="new Date(2024, 0, 1)"
          :max="new Date(2024, 11, 31)"
          @date-change="handleRangeChange"
          @validation-error="handleValidationError"
        />
        <p class="mt-2 text-sm text-gray-600">
          Range: {{ dateRange.length === 2 ? `${dateRange[0].toISOString()} to ${dateRange[1].toISOString()}` : 'Select start and end dates' }}
        </p>
      </div>

      <!-- Validation Test -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Validation Test</h2>
        <UiDatepicker
          ref="validationDatepicker"
          v-model="validationDate"
          placeholder="Select a date (weekends disabled)"
          display-format="MMMM D, YYYY"
          :disable-weekends="true"
          :disable-past-dates="true"
          @validation-error="handleValidationError"
        />
        <div class="mt-4 space-x-2">
          <button 
            @click="setToday"
            class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Set Today
          </button>
          <button 
            @click="clearDate"
            class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Clear Date
          </button>
          <button 
            @click="testValidation"
            class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Test Validation
          </button>
        </div>
        <p class="mt-2 text-sm text-gray-600">
          Validation Date: {{ validationDate ? validationDate.toISOString() : 'No date selected' }}
        </p>
      </div>

      <!-- Locale Test -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Locale Test (Indonesian)</h2>
        <UiDatepicker
          v-model="localeDate"
          placeholder="Pilih tanggal"
          display-format="D MMMM YYYY"
          locale="id"
          timezone="Asia/Jakarta"
          @date-change="handleLocaleChange"
        />
        <p class="mt-2 text-sm text-gray-600">
          Locale Date: {{ localeDate ? localeDate.toISOString() : 'Tanggal belum dipilih' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/id'

// Test data - initialize with safe values
const basicDate = ref<Date | null>(null)
const veeDate = ref<Date | null>(null)
const multipleDates = ref<Date[]>([])
const dateRange = ref<Date[]>([])
const validationDate = ref<Date | null>(null)
const localeDate = ref<Date | null>(null)

const validationDatepicker = ref<any>(null)

// Validation rules for Vee datepicker
const dateRules = {
  required: (value: any) => !!value || 'Date is required',
  minDate: (value: Date) => {
    const minDate = dayjs().subtract(1, 'year').toDate()
    return !value || value >= minDate || 'Date must be within the last year'
  }
}

// Event handlers
const handleDateChange = (date: Date | Date[] | undefined, formatted: string | string[]) => {
  console.log('Date changed:', date, 'Formatted:', formatted)
}

const handleVeeDateChange = (date: Date | Date[] | undefined, formatted: string | string[]) => {
  console.log('Vee date changed:', date, 'Formatted:', formatted)
}

const handleMultipleDateChange = (dates: Date | Date[] | undefined) => {
  console.log('Multiple dates changed:', dates)
}

const handleRangeChange = (dates: Date | Date[] | undefined) => {
  console.log('Range changed:', dates)
}

const handleValidationError = (error: string) => {
  console.log('Validation error:', error)
}

const handleLocaleChange = (date: Date | Date[] | undefined, formatted: string | string[]) => {
  console.log('Locale date changed:', date, 'Formatted:', formatted)
}

// Method tests
const setToday = () => {
  validationDatepicker.value?.setToday()
}

const clearDate = () => {
  validationDatepicker.value?.clearDate()
}

const testValidation = () => {
  const testDate = new Date(2023, 0, 1) // Old date
  const isValid = validationDatepicker.value?.validateDate(testDate)
  console.log('Validation test result:', isValid)
}

const handleSubmit = () => {
  console.log('Form submitted with date:', veeDate.value)
}
</script>