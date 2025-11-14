import { PrismaClient } from '@prisma/client'
import { requireAuthUser } from './../../utils/auth'
import { dashboardRateLimit } from './../../utils/rateLimit'
import { sanitizeFinancialData } from './../../utils/crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuthUser(event)
    
    // Apply rate limiting
    await dashboardRateLimit(event, user.id)
    
    // Get date range from query (default to current month)
    const query = getQuery(event)
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date()

    // Fetch financial summary data in parallel
    const [
      totalIncome,
      totalExpenses,
      totalInvestments,
      totalDebts,
      totalAssets,
      recentTransactions,
      upcomingDebts,
      investmentSummary,
      assetSummary
    ] = await Promise.all([
      // Total income
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'INCOME',
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      }),
      
      // Total expenses
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      }),
      
      // Total investments
      prisma.investment.aggregate({
        where: {
          userId: user.id,
          isActive: true
        },
        _sum: { 
          totalInvested: true,
          currentValue: true
        }
      }),
      
      // Total debts
      prisma.debt.aggregate({
        where: {
          userId: user.id,
          status: 'ACTIVE'
        },
        _sum: { currentBalance: true }
      }),
      
      // Total assets
      prisma.asset.aggregate({
        where: {
          userId: user.id,
          status: 'ACTIVE'
        },
        _sum: { 
          purchasePrice: true,
          currentValue: true
        }
      }),
      
      // Recent transactions (last 5)
      prisma.transaction.findMany({
        where: { userId: user.id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 5
      }),
      
      // Upcoming debt payments (next 30 days)
      prisma.debt.findMany({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          nextPaymentDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { nextPaymentDate: 'asc' },
        take: 5
      }),
      
      // Investment summary by type
      prisma.investment.groupBy({
        by: ['type'],
        where: {
          userId: user.id,
          isActive: true
        },
        _sum: {
          totalInvested: true,
          currentValue: true
        },
        _count: true
      }),
      
      // Asset summary by type
      prisma.asset.groupBy({
        by: ['type'],
        where: {
          userId: user.id,
          status: 'ACTIVE'
        },
        _sum: {
          purchasePrice: true,
          currentValue: true
        },
        _count: true
      })
    ])

    // Calculate financial metrics
    const income = totalIncome._sum.amount || 0
    const expenses = totalExpenses._sum.amount || 0
    const netCashFlow = income - expenses
    
    const totalInvested = totalInvestments._sum.totalInvested || 0
    const currentInvestmentValue = totalInvestments._sum.currentValue || 0
    const investmentReturn = totalInvested > 0 ? ((currentInvestmentValue - totalInvested) / totalInvested) * 100 : 0
    
    const totalDebt = totalDebts._sum.currentBalance || 0
    const totalAssetValue = totalAssets._sum.currentValue || totalAssets._sum.purchasePrice || 0
    const netWorth = totalAssetValue + currentInvestmentValue - totalDebt

    const result = {
      summary: {
        income,
        expenses,
        netCashFlow,
        totalInvested,
        currentInvestmentValue,
        investmentReturn: Number(investmentReturn.toFixed(2)),
        totalDebt,
        totalAssetValue,
        netWorth
      },
      recentTransactions,
      upcomingDebts,
      investmentBreakdown: investmentSummary,
      assetBreakdown: assetSummary
    }

    // Log sanitized data for security monitoring
    console.log('Finance dashboard accessed by user:', user.id, 'Data sanitized for security')
    
    return sanitizeFinancialData(result)
  } catch (error) {
    console.error('Error fetching finance dashboard:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch finance dashboard data'
    })
  } finally {
    await prisma.$disconnect()
  }
})