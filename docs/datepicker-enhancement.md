# Enhanced Datepicker Components Documentation

## Overview

The datepicker components have been enhanced with comprehensive day.js functionality, providing powerful date handling, validation, formatting, and localization capabilities.

## Components

### 1. UiDatepicker.vue

A standalone datepicker component with full day.js integration.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Pick a date'` | Placeholder text |
| `format` | `string` | `'LL'` | Date format string |
| `modelValue` | `Date \| Date[]` | `undefined` | v-model binding |
| `multiple` | `boolean` | `false` | Enable multiple date selection |
| `min` | `Date` | `undefined` | Minimum selectable date |
| `max` | `Date` | `undefined` | Maximum selectable date |
| `disabled` | `boolean` | `false` | Disable the component |
| `readonly` | `boolean` | `false` | Make component read-only |
| **Day.js Specific Props** |
| `locale` | `string` | `'en'` | Locale for date formatting |
| `timezone` | `string` | `undefined` | Timezone for date handling |
| `displayFormat` | `string` | `'MMMM D, YYYY'` | Display format for selected date |
| `parseFormat` | `string \| string[]` | `undefined` | Format(s) for parsing input |
| **Validation Props** |
| `disableWeekends` | `boolean` | `false` | Disable weekend selection |
| `disablePastDates` | `boolean` | `false` | Disable past dates |
| `disableFutureDates` | `boolean` | `false` | Disable future dates |
| `allowedDates` | `Date[]` | `[]` | Array of allowed dates |
| `disabledDates` | `Date[]` | `[]` | Array of disabled dates |
| **Range Selection** |
| `rangeMode` | `boolean` | `false` | Enable range selection mode |
| `rangeSeparator` | `string` | `', '` | Separator for multiple dates |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Date \| Date[] \| undefined` | Standard v-model update |
| `dateSelect` | `Date \| Date[]` | Emitted when date is selected |
| `dateChange` | `[date: Date \| Date[] \| undefined, formatted: string \| string[]]` | Emitted on date change with formatted output |
| `validationError` | `string` | Emitted when validation fails |
| `open` (Popover) | `boolean` | Controls calendar popover visibility via `v-model:open` |

#### Methods (Exposed)

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `clearDate` | `none` | `void` | Clear selected date |
| `setToday` | `none` | `void` | Set date to today |
| `setDate` | `date: Date` | `void` | Set specific date |
| `getFormattedDate` | `format?: string` | `string \| string[]` | Get formatted date string |
| `validateDate` | `date: Date` | `boolean` | Validate a date |
| `parseDateWithDayjs` | `dateString: string` | `Date \| null` | Parse date string |
| `formatDateWithDayjs` | `date: Date, format?: string` | `string` | Format date with day.js |

#### Usage Examples

```vue
<!-- Basic usage -->
<UiDatepicker v-model="selectedDate" placeholder="Select a date" />

<!-- With validation -->
<UiDatepicker
  v-model="selectedDate"
  :disable-weekends="true"
  :disable-past-dates="true"
  @validation-error="handleValidationError"
/>

<!-- Multiple dates -->
<UiDatepicker
  v-model="selectedDates"
  multiple
  display-format="MMM D"
  range-separator=" | "
/>

<!-- With locale -->
<UiDatepicker
  v-model="selectedDate"
  locale="id"
  display-format="D MMMM YYYY"
/>

<!-- Programmatic control -->
<template>
  <UiDatepicker ref="datepicker" v-model="selectedDate" />
  <button @click="$refs.datepicker.setToday()">Set Today</button>
  <button @click="$refs.datepicker.clearDate()">Clear</button>
</template>
```

### 2. UiVeeDatepicker.vue

A vee-validate integrated datepicker component with enhanced validation capabilities.

#### Props

Includes all props from `UiDatepicker` plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Form label |
| `icon` | `string` | `'lucide:calendar-days'` | Icon name |
| `hint` | `string` | `undefined` | Help text |
| `name` | `string` | `auto-generated` | Field name for validation |
| `id` | `string` | `auto-generated` | Element ID |
| `rules` | `any` | `{}` | Vee-validate validation rules |
| `validateOnMount` | `boolean` | `false` | Validate on component mount |
| `required` | `boolean` | `false` | Mark field as required |

#### Events

Same as `UiDatepicker` plus standard form field events.

#### Methods (Exposed)

Same as `UiDatepicker` plus form validation methods.

#### Usage Examples

```vue
<!-- Basic form usage -->
<UiVeeDatepicker
  v-model="formData.date"
  name="birthDate"
  label="Birth Date"
  placeholder="Select your birth date"
  required
/>

<!-- With custom validation -->
<UiVeeDatepicker
  v-model="formData.date"
  name="eventDate"
  label="Event Date"
  :rules="{
    required: (value) => !!value || 'Date is required',
    future: (value) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return !value || value >= today || 'Date must be in the future'
    }
  }"
  :disable-past-dates="true"
/>

<!-- With enhanced validation -->
<UiVeeDatepicker
  v-model="formData.date"
  name="appointmentDate"
  label="Appointment Date"
  :disable-weekends="true"
  :allowed-dates="workingDays"
  required
/>
```

## Day.js Integration Features

### 1. Date Formatting

```javascript
// Multiple format support
const formats = {
  display: 'MMMM D, YYYY',     // January 1, 2024
  iso: 'YYYY-MM-DD',           // 2024-01-01
  localized: 'L',              // 01/01/2024 (locale dependent)
  custom: 'DD/MM/YYYY'         // 01/01/2024
}
```

### 2. Localization

```javascript
// Supported locales
import 'dayjs/locale/id'    // Indonesian
import 'dayjs/locale/es'    // Spanish
import 'dayjs/locale/fr'    // French

// Usage
<UiDatepicker locale="id" display-format="D MMMM YYYY" />
```

### 3. Timezone Support

```javascript
// Timezone handling
<UiDatepicker 
  timezone="Asia/Jakarta" 
  display-format="YYYY-MM-DD HH:mm:ss z"
/>

Notes:
- Input and output conversions use the provided `timezone` when formatting.
- Internal model normalization aligns with the current timezone to avoid off-by-one errors.
```

### 4. Date Parsing

```javascript
// Multiple parse formats
<UiDatepicker
  :parse-format="['YYYY-MM-DD', 'DD/MM/YYYY', 'D MMMM YYYY']"
/>
```

### 5. Validation Features

```javascript
// Weekend validation
<UiDatepicker :disable-weekends="true" />

// Date range validation
<UiDatepicker
  :disable-past-dates="true"
  :disable-future-dates="false"
  :min="new Date(2024, 0, 1)"
  :max="new Date(2024, 11, 31)"
/>

// Custom allowed/disabled dates
<UiDatepicker
  :allowed-dates="holidayDates"
  :disabled-dates="blockedDates"
/>
```

## Testing

A comprehensive test page is available at `/test-datepicker` to verify all functionality:

- Basic date selection
- Multiple date selection
- Date range selection
- Range mode with min/max boundaries
- Validation testing
- Locale testing
- Programmatic control testing
- Timezone rendering using `Asia/Jakarta`

## Migration Guide

### From Basic Datepicker

```vue
<!-- Before -->
<UiDatepicker v-model="date" placeholder="Select date" />

<!-- After (enhanced) -->
<UiDatepicker
  v-model="date"
  placeholder="Select date"
  display-format="MMMM D, YYYY"
  :disable-past-dates="true"
  @date-change="handleDateChange"
/>
```

### From Vee Datepicker

```vue
<!-- Before -->
<UiVeeDatepicker
  v-model="form.date"
  name="date"
  label="Date"
/>

<!-- After (enhanced) -->
<UiVeeDatepicker
  v-model="form.date"
  name="date"
  label="Date"
  display-format="MMMM D, YYYY"
  :disable-weekends="true"
  :rules="customValidationRules"
/>
```

## Best Practices

1. **Use consistent formatting** across your application
2. **Implement proper validation** for date constraints
3. **Handle timezone differences** when dealing with international users
4. **Provide clear feedback** for validation errors
5. **Use appropriate locales** for better user experience
6. **Test date edge cases** like leap years, DST transitions
7. **Consider accessibility** with proper ARIA labels and keyboard navigation

## Troubleshooting

### Common Issues

1. **Date parsing errors**: Check `parseFormat` prop matches input format
2. **Validation not working**: Ensure validation props are properly set
3. **Locale not applied**: Import locale files before using them
4. **Timezone issues**: Set appropriate timezone prop

### Debug Mode

Enable debug logging by listening to validation events:

```vue
<UiDatepicker
  v-model="date"
  @validation-error="(error) => console.log('Validation error:', error)"
  @date-change="(date, formatted) => console.log('Date changed:', date, formatted)"
/>
```

## Performance Considerations

- Components use computed properties for efficient reactivity
- Day.js plugins are loaded only when needed
- Validation is performed on-demand to avoid unnecessary calculations
- Date formatting is cached to prevent repeated parsing

## Browser Compatibility

- Modern browsers with ES6+ support
- IE11+ with appropriate polyfills
- Mobile browsers (iOS Safari, Chrome Mobile)
- Touch device support with proper event handling
<!-- Range mode (start-end order enforced) -->
<UiDatepicker
  v-model="dateRange"
  :multiple="true"
  :range-mode="true"
  :min="new Date(2024, 0, 1)"
  :max="new Date(2024, 11, 31)"
  @validation-error="onError"
/>