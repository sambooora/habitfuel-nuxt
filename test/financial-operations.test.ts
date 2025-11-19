import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    debt: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn()
    },
    investment: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    asset: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    transaction: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn()
    },
    auditLog: {
      create: vi.fn()
    },
    $transaction: vi.fn(async (callback) => {
      const tx = {
        debt: {
          update: vi.fn(),
          delete: vi.fn(),
          deleteMany: vi.fn()
        },
        investment: {
          update: vi.fn(),
          delete: vi.fn()
        },
        asset: {
          update: vi.fn(),
          delete: vi.fn()
        },
        transaction: {
          update: vi.fn(),
          delete: vi.fn(),
          deleteMany: vi.fn()
        },
        auditLog: {
          create: vi.fn()
        }
      }
      return await callback(tx)
    }),
    $disconnect: vi.fn()
  }))
}))

// Mock auth utilities
vi.mock('../../../utils/auth', () => ({
  requireAuthUser: vi.fn(() => Promise.resolve({ id: 'test-user-id' }))
}))

// Mock h3 utilities
vi.mock('h3', () => ({
  createError: vi.fn((error) => {
    const err = new Error(error.statusMessage)
    err.statusCode = error.statusCode
    err.data = error.data
    return err
  }),
  getRouterParam: vi.fn((event, param) => 'test-id'),
  readBody: vi.fn(() => Promise.resolve({
    lenderName: 'Updated Lender',
    principalAmount: 10000,
    currentBalance: 8000
  }))
}))

describe('Financial Operations - Update and Delete Functions', () => {
  let prisma: PrismaClient
  let mockEvent: any

  beforeEach(() => {
    vi.clearAllMocks()
    prisma = new PrismaClient()
    mockEvent = {}
  })

  describe('Debt Operations', () => {
    it('should update debt successfully', async () => {
      const mockDebt = {
        id: 'test-id',
        userId: 'test-user-id',
        lenderName: 'Original Lender',
        principalAmount: { toNumber: () => 15000 },
        currentBalance: { toNumber: () => 12000 }
      }

      const updatedDebt = {
        ...mockDebt,
        lenderName: 'Updated Lender',
        principalAmount: { toNumber: () => 10000 },
        currentBalance: { toNumber: () => 8000 }
      }

      // Mock existing debt check
      prisma.debt.findUnique = vi.fn().mockResolvedValue(mockDebt)
      
      // Mock transaction
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        const tx = {
          auditLog: { create: vi.fn() },
          debt: { update: vi.fn().mockResolvedValue(updatedDebt) }
        }
        return await callback(tx)
      })

      const updateDebtHandler = await import('../../../server/api/finance/debts/[id].patch')
      const result = await updateDebtHandler.default(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data.lenderName).toBe('Updated Lender')
      expect(result.message).toBe('Debt updated successfully')
    })

    it('should delete debt with related transactions', async () => {
      const mockDebt = {
        id: 'test-id',
        userId: 'test-user-id',
        lenderName: 'Test Lender',
        principalAmount: { toNumber: () => 15000 },
        currentBalance: { toNumber: () => 12000 },
        status: 'ACTIVE',
        transactions: [
          { id: 'trans-1', amount: { toNumber: () => 500 }, date: new Date() }
        ]
      }

      // Mock existing debt check with transactions
      prisma.debt.findUnique = vi.fn().mockResolvedValue(mockDebt)
      
      // Mock transaction
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        const tx = {
          auditLog: { create: vi.fn() },
          transaction: { deleteMany: vi.fn() },
          debt: { delete: vi.fn().mockResolvedValue(mockDebt) }
        }
        return await callback(tx)
      })

      const deleteDebtHandler = await import('../../../server/api/finance/debts/[id].delete')
      const result = await deleteDebtHandler.default(mockEvent)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Debt deleted successfully')
      expect(result.details.relatedTransactionsDeleted).toBe(1)
    })

    it('should handle debt not found', async () => {
      prisma.debt.findUnique = vi.fn().mockResolvedValue(null)

      const updateDebtHandler = await import('../../../server/api/finance/debts/[id].patch')
      
      await expect(updateDebtHandler.default(mockEvent))
        .rejects.toThrow('Debt not found')
    })

    it('should handle unauthorized access', async () => {
      const mockDebt = {
        id: 'test-id',
        userId: 'different-user-id' // Different user
      }

      prisma.debt.findUnique = vi.fn().mockResolvedValue(mockDebt)

      const updateDebtHandler = await import('../../../server/api/finance/debts/[id].patch')
      
      await expect(updateDebtHandler.default(mockEvent))
        .rejects.toThrow('You do not have permission to update this debt')
    })
  })

  describe('Investment Operations', () => {
    it('should update investment with current value calculation', async () => {
      const mockInvestment = {
        id: 'test-id',
        userId: 'test-user-id',
        name: 'Original Investment',
        quantity: { toNumber: () => 100 },
        currentPrice: { toNumber: () => 50 },
        currentValue: { toNumber: () => 5000 }
      }

      const updatedInvestment = {
        ...mockInvestment,
        name: 'Updated Investment',
        currentPrice: { toNumber: () => 60 },
        currentValue: { toNumber: () => 6000 } // 100 * 60
      }

      prisma.investment.findUnique = vi.fn().mockResolvedValue(mockInvestment)
      
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        const tx = {
          auditLog: { create: vi.fn() },
          investment: { update: vi.fn().mockResolvedValue(updatedInvestment) }
        }
        return await callback(tx)
      })

      const updateInvestmentHandler = await import('../../../server/api/finance/investments/[id].patch')
      const result = await updateInvestmentHandler.default(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Updated Investment')
      expect(result.message).toBe('Investment updated successfully')
    })

    it('should handle investment deletion with transactions', async () => {
      const mockInvestment = {
        id: 'test-id',
        userId: 'test-user-id',
        name: 'Test Investment',
        type: 'STOCK',
        symbol: 'TEST',
        totalInvested: { toNumber: () => 10000 },
        currentValue: { toNumber: () => 12000 },
        isActive: true,
        transactions: [
          { id: 'trans-1', amount: { toNumber: () => 1000 }, date: new Date(), type: 'INVESTMENT_BUY' }
        ]
      }

      prisma.investment.findUnique = vi.fn().mockResolvedValue(mockInvestment)
      
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        const tx = {
          auditLog: { create: vi.fn() },
          transaction: { deleteMany: vi.fn() },
          investment: { delete: vi.fn().mockResolvedValue(mockInvestment) }
        }
        return await callback(tx)
      })

      const deleteInvestmentHandler = await import('../../../server/api/finance/investments/[id].delete')
      const result = await deleteInvestmentHandler.default(mockEvent)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Investment deleted successfully')
      expect(result.details.relatedTransactionsDeleted).toBe(1)
    })
  })

  describe('Asset Operations', () => {
    it('should update asset with date conversions', async () => {
      const mockAsset = {
        id: 'test-id',
        userId: 'test-user-id',
        name: 'Original Asset',
        purchaseDate: new Date('2023-01-01'),
        warrantyExpiry: new Date('2025-01-01')
      }

      const updatedAsset = {
        ...mockAsset,
        name: 'Updated Asset',
        purchaseDate: new Date('2023-02-01'),
        warrantyExpiry: new Date('2026-01-01')
      }

      prisma.asset.findUnique = vi.fn().mockResolvedValue(mockAsset)
      
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        const tx = {
          auditLog: { create: vi.fn() },
          asset: { update: vi.fn().mockResolvedValue(updatedAsset) }
        }
        return await callback(tx)
      })

      const updateAssetHandler = await import('../../../server/api/finance/assets/[id].patch')
      const result = await updateAssetHandler.default(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Updated Asset')
      expect(result.message).toBe('Asset updated successfully')
    })
  })

  describe('Transaction Operations', () => {
    it('should update transaction with audit logging', async () => {
      const mockTransaction = {
        id: 'test-id',
        userId: 'test-user-id',
        type: 'EXPENSE',
        amount: { toNumber: () => 100 },
        description: 'Original Description',
        date: new Date()
      }

      const updatedTransaction = {
        ...mockTransaction,
        description: 'Updated Description',
        amount: { toNumber: () => 150 }
      }

      prisma.transaction.findFirst = vi.fn().mockResolvedValue(mockTransaction)
      
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        const tx = {
          auditLog: { create: vi.fn() },
          transaction: { update: vi.fn().mockResolvedValue(updatedTransaction) }
        }
        return await callback(tx)
      })

      const updateTransactionHandler = await import('../../../server/api/finance/transactions/[id].patch')
      const result = await updateTransactionHandler.default(mockEvent)

      expect(result.description).toBe('Updated Description')
      expect(result.amount.toNumber()).toBe(150)
    })
  })

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidData = {
        lenderName: '', // Invalid: empty string
        principalAmount: -1000, // Invalid: negative number
        currentBalance: 0 // Invalid: zero
      }

      readBody.mockResolvedValue(invalidData)

      const updateDebtHandler = await import('../../../server/api/finance/debts/[id].patch')
      
      await expect(updateDebtHandler.default(mockEvent))
        .rejects.toThrow('Validation error')
    })

    it('should handle database errors gracefully', async () => {
      prisma.debt.findUnique = vi.fn().mockRejectedValue(new Error('Database connection failed'))

      const updateDebtHandler = await import('../../../server/api/finance/debts/[id].patch')
      
      await expect(updateDebtHandler.default(mockEvent))
        .rejects.toThrow('Failed to update debt')
    })
  })

  describe('Authorization', () => {
    it('should require authentication for all operations', async () => {
      requireAuthUser.mockRejectedValue(new Error('Authentication required'))

      const updateDebtHandler = await import('../../../server/api/finance/debts/[id].patch')
      
      await expect(updateDebtHandler.default(mockEvent))
        .rejects.toThrow('Authentication required')
    })
  })

  describe('Referential Integrity', () => {
    it('should handle related transactions during deletion', async () => {
      const mockDebt = {
        id: 'test-id',
        userId: 'test-user-id',
        transactions: [
          { id: 'trans-1', amount: { toNumber: () => 500 }, date: new Date() },
          { id: 'trans-2', amount: { toNumber: () => 300 }, date: new Date() }
        ]
      }

      prisma.debt.findUnique = vi.fn().mockResolvedValue(mockDebt)
      
      let deletedTransactionCount = 0
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        const tx = {
          auditLog: { create: vi.fn() },
          transaction: { 
            deleteMany: vi.fn().mockImplementation(() => {
              deletedTransactionCount = mockDebt.transactions.length
              return Promise.resolve({ count: mockDebt.transactions.length })
            })
          },
          debt: { delete: vi.fn().mockResolvedValue(mockDebt) }
        }
        return await callback(tx)
      })

      const deleteDebtHandler = await import('../../../server/api/finance/debts/[id].delete')
      const result = await deleteDebtHandler.default(mockEvent)

      expect(result.details.relatedTransactionsDeleted).toBe(2)
      expect(deletedTransactionCount).toBe(2)
    })
  })
})

describe('Financial Operations - Frontend Composables', () => {
  describe('useFinance - Update Functions', () => {
    it('should update transaction in state', async () => {
      const mockTransaction = {
        id: 'trans-1',
        description: 'Updated Transaction',
        amount: 150
      }

      // Mock $fetch
      global.$fetch = vi.fn().mockResolvedValue(mockTransaction)

      const { updateTransaction, state } = useFinance()
      
      // Set initial state
      state.transactions = [
        { id: 'trans-1', description: 'Original Transaction', amount: 100 }
      ]

      const result = await updateTransaction('trans-1', {
        description: 'Updated Transaction',
        amount: 150
      })

      expect(result).toEqual(mockTransaction)
      expect(state.transactions[0].description).toBe('Updated Transaction')
      expect(state.transactions[0].amount).toBe(150)
    })

    it('should handle update errors', async () => {
      global.$fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { updateInvestment, state } = useFinance()
      
      await expect(updateInvestment('inv-1', { name: 'Updated Investment' }))
        .rejects.toThrow('Network error')
    })
  })

  describe('useFinance - Delete Functions', () => {
    it('should delete transaction from state', async () => {
      global.$fetch = vi.fn().mockResolvedValue({ success: true })

      const { deleteTransaction, state } = useFinance()
      
      // Set initial state
      state.transactions = [
        { id: 'trans-1', description: 'Transaction 1' },
        { id: 'trans-2', description: 'Transaction 2' }
      ]

      const result = await deleteTransaction('trans-1', true)

      expect(result.success).toBe(true)
      expect(state.transactions).toHaveLength(1)
      expect(state.transactions.find(t => t.id === 'trans-1')).toBeUndefined()
    })

    it('should require confirmation for deletion', async () => {
      const { deleteDebt } = useFinance()
      
      await expect(deleteDebt('debt-1', false))
        .rejects.toThrow('Deletion requires confirmation')
    })
  })

  describe('useConfirmation', () => {
    it('should show delete confirmation', async () => {
      const { confirmDelete, confirmationOptions, handleConfirm } = useConfirmation()
      
      const confirmationPromise = confirmDelete('Transaction', 'Test Transaction')
      
      expect(confirmationOptions.value).toBeTruthy()
      expect(confirmationOptions.value?.title).toBe('Hapus Transaction')
      expect(confirmationOptions.value?.type).toBe('danger')
      
      // Simulate user confirmation
      handleConfirm()
      
      const result = await confirmationPromise
      expect(result.confirmed).toBe(true)
      expect(result.cancelled).toBe(false)
    })

    it('should show bulk delete confirmation', async () => {
      const { confirmBulkDelete, confirmationOptions, handleConfirm } = useConfirmation()
      
      const confirmationPromise = confirmBulkDelete('Investment', 5)
      
      expect(confirmationOptions.value?.message).toContain('5 investment')
      expect(confirmationOptions.value?.type).toBe('danger')
      
      handleConfirm()
      
      const result = await confirmationPromise
      expect(result.confirmed).toBe(true)
    })
  })

  describe('useFinancialOperations', () => {
    it('should update item with confirmation', async () => {
      const mockItem = { id: 'item-1', name: 'Updated Item' }
      global.$fetch = vi.fn().mockResolvedValue(mockItem)

      const { updateFinancialItem } = useFinancialOperations()
      
      // Mock confirmation to return true
      const { handleConfirm } = useConfirmation()
      
      // This would normally be handled by the UI, but for testing we'll simulate it
      setTimeout(() => handleConfirm(), 0)
      
      const result = await updateFinancialItem('asset', 'item-1', { name: 'Updated Item' }, 'Test Asset')
      
      expect(result).toEqual(mockItem)
    })

    it('should cancel update if not confirmed', async () => {
      const { updateFinancialItem } = useFinancialOperations()
      const { handleCancel } = useConfirmation()
      
      // Simulate user cancellation
      setTimeout(() => handleCancel(), 0)
      
      await expect(updateFinancialItem('debt', 'debt-1', { name: 'Updated Debt' }))
        .rejects.toThrow('Update cancelled by user')
    })

    it('should delete item with confirmation', async () => {
      global.$fetch = vi.fn().mockResolvedValue({ success: true })

      const { deleteFinancialItem } = useFinancialOperations()
      const { handleConfirm } = useConfirmation()
      
      // Simulate user confirmation
      setTimeout(() => handleConfirm(), 0)
      
      const result = await deleteFinancialItem('investment', 'inv-1', 'Test Investment')
      
      expect(result.success).toBe(true)
    })

    it('should handle bulk deletion', async () => {
      global.$fetch = vi.fn().mockResolvedValue({ success: true })

      const { bulkDeleteFinancialItems } = useFinancialOperations()
      const { handleConfirm } = useConfirmation()
      
      // Simulate user confirmation
      setTimeout(() => handleConfirm(), 0)
      
      const results = await bulkDeleteFinancialItems('transaction', ['trans-1', 'trans-2', 'trans-3'])
      
      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
    })
  })
})