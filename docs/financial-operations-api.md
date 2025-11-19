# Financial Operations API Documentation

## Overview

This document provides comprehensive documentation for the update and delete operations across all financial modules (Transaction, Investment, Debt, Asset). All operations follow consistent patterns for validation, authorization, audit logging, and error handling.

## Common Features

### Authentication & Authorization
- All endpoints require authentication via `requireAuthUser`
- Users can only update/delete their own financial records
- Unauthorized access returns 403 Forbidden

### Validation
- Input validation using Zod schemas
- All fields are optional for partial updates
- Proper data type conversion (dates, numbers)
- Validation errors return 422 Unprocessable Entity

### Audit Logging
- All operations are logged to the audit_log table
- Logs include user ID, action type, resource ID, and changes
- Audit logs are created within database transactions

### Error Handling
- Consistent error responses with appropriate HTTP status codes
- Detailed error messages for debugging
- Proper error propagation and handling

### Referential Integrity
- Deletion operations handle related transactions
- Options for cascade delete or nullify foreign keys
- Related records count returned in response

## API Endpoints

### Transaction Operations

#### Update Transaction
```http
PATCH /api/finance/transactions/:id
```

**Request Body:**
```json
{
  "type": "EXPENSE",
  "amount": 150.50,
  "description": "Updated description",
  "date": "2024-01-15T10:00:00Z",
  "categoryId": "category-uuid",
  "isRecurring": false,
  "recurrenceInterval": "monthly",
  "recurrenceEndDate": "2024-12-31T23:59:59Z",
  "tags": ["updated", "tag"],
  "attachments": ["file1.pdf", "file2.jpg"]
}
```

**Response:**
```json
{
  "id": "transaction-uuid",
  "type": "EXPENSE",
  "amount": 150.50,
  "description": "Updated description",
  "date": "2024-01-15T10:00:00Z",
  "category": {
    "id": "category-uuid",
    "name": "Food",
    "color": "#FF6B6B",
    "icon": "restaurant"
  },
  "userId": "user-uuid",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Delete Transaction
```http
DELETE /api/finance/transactions/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

### Investment Operations

#### Update Investment
```http
PATCH /api/finance/investments/:id
```

**Request Body:**
```json
{
  "type": "STOCK",
  "name": "Updated Investment Name",
  "symbol": "AAPL",
  "quantity": 50,
  "purchasePrice": 150.00,
  "currentPrice": 175.50,
  "totalInvested": 7500.00,
  "purchaseDate": "2023-06-01T00:00:00Z",
  "broker": "Updated Broker",
  "notes": "Updated investment notes",
  "tags": ["tech", "growth"],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "investment-uuid",
    "type": "STOCK",
    "name": "Updated Investment Name",
    "symbol": "AAPL",
    "quantity": 50,
    "purchasePrice": 150.00,
    "currentPrice": 175.50,
    "totalInvested": 7500.00,
    "currentValue": 8775.00, // Auto-calculated: quantity * currentPrice
    "purchaseDate": "2023-06-01T00:00:00Z",
    "broker": "Updated Broker",
    "notes": "Updated investment notes",
    "tags": ["tech", "growth"],
    "isActive": true,
    "userId": "user-uuid",
    "createdAt": "2023-06-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Investment updated successfully"
}
```

#### Delete Investment
```http
DELETE /api/finance/investments/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "investment-uuid",
    "name": "Updated Investment Name",
    "type": "STOCK",
    "symbol": "AAPL"
  },
  "message": "Investment deleted successfully",
  "details": {
    "relatedTransactionsDeleted": 3
  }
}
```

### Debt Operations

#### Update Debt
```http
PATCH /api/finance/debts/:id
```

**Request Body:**
```json
{
  "lenderName": "Updated Bank Name",
  "principalAmount": 25000.00,
  "interestRate": 4.5,
  "currentBalance": 20000.00,
  "monthlyPayment": 500.00,
  "startDate": "2023-01-01T00:00:00Z",
  "dueDate": "2033-01-01T00:00:00Z",
  "nextPaymentDate": "2024-02-01T00:00:00Z",
  "status": "ACTIVE",
  "collateral": "Updated collateral information",
  "notes": "Updated debt notes",
  "tags": ["mortgage", "priority"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "debt-uuid",
    "lenderName": "Updated Bank Name",
    "principalAmount": 25000.00,
    "interestRate": 4.5,
    "currentBalance": 20000.00,
    "monthlyPayment": 500.00,
    "startDate": "2023-01-01T00:00:00Z",
    "dueDate": "2033-01-01T00:00:00Z",
    "nextPaymentDate": "2024-02-01T00:00:00Z",
    "status": "ACTIVE",
    "collateral": "Updated collateral information",
    "notes": "Updated debt notes",
    "tags": ["mortgage", "priority"],
    "totalPayments": 5000.00,
    "userId": "user-uuid",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Debt updated successfully"
}
```

#### Delete Debt
```http
DELETE /api/finance/debts/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "debt-uuid",
    "lenderName": "Updated Bank Name",
    "principalAmount": 25000.00,
    "currentBalance": 20000.00,
    "status": "ACTIVE"
  },
  "message": "Debt deleted successfully",
  "details": {
    "relatedTransactionsDeleted": 5
  }
}
```

### Asset Operations

#### Update Asset
```http
PATCH /api/finance/assets/:id
```

**Request Body:**
```json
{
  "type": "REAL_ESTATE",
  "name": "Updated Property Name",
  "description": "Updated property description",
  "purchasePrice": 300000.00,
  "currentValue": 350000.00,
  "purchaseDate": "2022-06-15T00:00:00Z",
  "depreciationRate": 2.5,
  "status": "ACTIVE",
  "location": "Updated Address, City, Country",
  "serialNumber": "UPDATED-SN-12345",
  "warrantyExpiry": "2032-06-15T00:00:00Z",
  "insuranceInfo": "Updated insurance policy details",
  "notes": "Updated asset notes and maintenance history",
  "tags": ["property", "investment", "long-term"],
  "attachments": ["deed.pdf", "insurance.pdf", "photos.zip"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "asset-uuid",
    "type": "REAL_ESTATE",
    "name": "Updated Property Name",
    "description": "Updated property description",
    "purchasePrice": 300000.00,
    "currentValue": 350000.00,
    "purchaseDate": "2022-06-15T00:00:00Z",
    "depreciationRate": 2.5,
    "status": "ACTIVE",
    "location": "Updated Address, City, Country",
    "serialNumber": "UPDATED-SN-12345",
    "warrantyExpiry": "2032-06-15T00:00:00Z",
    "insuranceInfo": "Updated insurance policy details",
    "notes": "Updated asset notes and maintenance history",
    "tags": ["property", "investment", "long-term"],
    "attachments": ["deed.pdf", "insurance.pdf", "photos.zip"],
    "userId": "user-uuid",
    "createdAt": "2022-06-15T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Asset updated successfully"
}
```

#### Delete Asset
```http
DELETE /api/finance/assets/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "asset-uuid",
    "name": "Updated Property Name",
    "type": "REAL_ESTATE",
    "purchasePrice": 300000.00,
    "currentValue": 350000.00
  },
  "message": "Asset deleted successfully",
  "details": {
    "relatedTransactionsDeleted": 2
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "statusMessage": "Invalid request data",
  "data": {
    "errors": [
      {
        "code": "invalid_type",
        "expected": "number",
        "received": "string",
        "path": ["amount"],
        "message": "Expected number, received string"
      }
    ]
  }
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "statusMessage": "You do not have permission to update this transaction"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "statusMessage": "Transaction not found"
}
```

### 422 Unprocessable Entity
```json
{
  "statusCode": 422,
  "statusMessage": "Validation error",
  "data": {
    "errors": [
      {
        "code": "too_small",
        "minimum": 0,
        "type": "number",
        "inclusive": false,
        "exact": false,
        "message": "Number must be greater than 0",
        "path": ["amount"]
      }
    ]
  }
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "statusMessage": "Failed to update transaction"
}
```

## Frontend Integration

### Using Composables

#### Basic Update Operations
```typescript
// Update a transaction
const { updateTransaction } = useFinance()
const updatedTransaction = await updateTransaction('transaction-id', {
  description: 'Updated description',
  amount: 200.50,
  categoryId: 'category-uuid'
})

// Update an investment
const { updateInvestment } = useFinance()
const updatedInvestment = await updateInvestment('investment-id', {
  currentPrice: 180.00,
  notes: 'Updated investment analysis'
})

// Update a debt
const { updateDebt } = useFinance()
const updatedDebt = await updateDebt('debt-id', {
  currentBalance: 15000.00,
  status: 'ACTIVE'
})

// Update an asset
const { updateAsset } = useFinance()
const updatedAsset = await updateAsset('asset-id', {
  currentValue: 400000.00,
  status: 'ACTIVE'
})
```

#### Basic Delete Operations
```typescript
// Delete operations require confirmation
const { deleteTransaction, deleteInvestment, deleteDebt, deleteAsset } = useFinance()

// Delete with confirmation
await deleteTransaction('transaction-id', true)
await deleteInvestment('investment-id', true)
await deleteDebt('debt-id', true)
await deleteAsset('asset-id', true)
```

#### Using Confirmation Dialogs
```typescript
// Using the confirmation composable
const { confirmDelete, confirmUpdate } = useConfirmation()

// Confirm before update
const confirmed = await confirmUpdate('Investment', 'Apple Stock')
if (confirmed) {
  await updateInvestment('investment-id', { currentPrice: 185.00 })
}

// Confirm before delete
const confirmed = await confirmDelete('Transaction', 'Grocery Shopping')
if (confirmed) {
  await deleteTransaction('transaction-id', true)
}
```

#### Using Financial Operations Composable
```typescript
// Using the comprehensive financial operations composable
const { updateFinancialItem, deleteFinancialItem } = useFinancialOperations()

// Update with automatic confirmation
await updateFinancialItem('investment', 'investment-id', {
  currentPrice: 190.00,
  notes: 'Updated analysis'
}, 'Apple Stock')

// Delete with automatic confirmation
await deleteFinancialItem('transaction', 'transaction-id', 'Grocery Shopping')

// Bulk operations
const { bulkDeleteFinancialItems } = useFinancialOperations()
const results = await bulkDeleteFinancialItems('transaction', [
  'trans-1', 'trans-2', 'trans-3'
])
```

### State Management

All operations automatically update the local state:

```typescript
const { state, updateTransaction, deleteTransaction } = useFinance()

// Before update
console.log(state.transactions) // Original transaction list

// Update transaction
await updateTransaction('transaction-id', { amount: 300.00 })

// State is automatically updated
console.log(state.transactions) // Updated transaction list

// Delete transaction
await deleteTransaction('transaction-id', true)

// State is automatically updated
console.log(state.transactions) // Transaction removed from list
```

### Error Handling

```typescript
try {
  await updateInvestment('investment-id', {
    currentPrice: -100.00 // Invalid: negative price
  })
} catch (error) {
  if (error.statusCode === 422) {
    console.log('Validation error:', error.data.errors)
  } else if (error.statusCode === 403) {
    console.log('Permission denied')
  } else {
    console.log('Unexpected error:', error.message)
  }
}
```

### Loading States

```typescript
const { state, updateAsset } = useFinance()

// Check loading state
console.log(state.loading) // true during operation

await updateAsset('asset-id', { currentValue: 500000.00 })

console.log(state.loading) // false after operation

// Check for errors
if (state.error) {
  console.log('Error:', state.error)
}
```

## Performance Considerations

### Batch Operations
- Bulk delete operations process items sequentially to maintain data integrity
- Individual operations are atomic and use database transactions
- Audit logging is performed within the same transaction as the main operation

### Data Consistency
- All operations maintain referential integrity
- Related transactions are handled appropriately during deletion
- State updates are performed optimistically on the frontend

### Optimization Tips
1. Use partial updates when possible (only send changed fields)
2. Implement debouncing for frequent updates
3. Consider batching multiple small updates
4. Use optimistic updates for better UX
5. Implement proper loading states and error boundaries

## Security Considerations

### Authorization
- All operations verify resource ownership
- Users can only modify their own financial data
- Proper error messages for unauthorized access

### Data Validation
- Comprehensive input validation using Zod schemas
- Type safety with TypeScript
- Proper sanitization of user inputs

### Audit Trail
- Complete audit logging for all operations
- Changes are tracked with before/after values
- Audit logs include timestamps and user identification

### Rate Limiting
- Consider implementing rate limiting for update/delete operations
- Use appropriate rate limits for different operation types
- Monitor for suspicious activity patterns

## Testing

### Unit Tests
- Comprehensive test coverage for all operations
- Mock external dependencies (database, auth)
- Test error scenarios and edge cases
- Validate data consistency and state updates

### Integration Tests
- Test complete workflows (create → update → delete)
- Verify database transactions and rollback behavior
- Test concurrent operations and race conditions
- Validate audit logging functionality

### Frontend Tests
- Test composable functions and state management
- Verify UI interactions and confirmation dialogs
- Test error handling and user feedback
- Validate form validation and submission

## Maintenance and Extension

### Adding New Fields
1. Update Zod validation schemas
2. Modify database schema if needed
3. Update frontend types and interfaces
4. Add appropriate validation rules
5. Update audit logging to include new fields

### Adding New Operations
1. Follow the established patterns for consistency
2. Implement proper validation and authorization
3. Add audit logging for the new operation
4. Create corresponding frontend composables
5. Write comprehensive tests

### Database Migrations
- Always create proper migration files
- Test migrations with existing data
- Consider backward compatibility
- Document breaking changes

### Performance Monitoring
- Monitor operation execution times
- Track error rates and types
- Analyze audit log growth
- Optimize slow queries and operations