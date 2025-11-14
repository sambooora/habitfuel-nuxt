export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv'
  dataType: 'transactions' | 'investments' | 'debts' | 'assets' | 'summary'
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: {
    types?: string[]
    categories?: string[]
    status?: string[]
  }
  includeCharts?: boolean
  fileName?: string
}

export const useFinanceExport = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref(0)

  const exportData = async (options: ExportOptions) => {
    loading.value = true
    error.value = null
    progress.value = 0

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        progress.value = Math.min(progress.value + 10, 90)
      }, 200)

      let data: any[] = []
      let headers: string[] = []
      let title = ''

      // Prepare data based on type
      switch (options.dataType) {
        case 'transactions':
          data = await prepareTransactionData(options)
          headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Tags']
          title = 'Financial Transactions'
          break
        
        case 'investments':
          data = await prepareInvestmentData(options)
          headers = ['Name', 'Type', 'Symbol', 'Purchase Price', 'Current Price', 'Quantity', 'Total Invested', 'Current Value', 'Return %']
          title = 'Investment Portfolio'
          break
        
        case 'debts':
          data = await prepareDebtData(options)
          headers = ['Lender', 'Principal Amount', 'Current Balance', 'Interest Rate %', 'Monthly Payment', 'Next Payment Date', 'Status']
          title = 'Debt Summary'
          break
        
        case 'assets':
          data = await prepareAssetData(options)
          headers = ['Name', 'Type', 'Purchase Price', 'Current Value', 'Purchase Date', 'Location', 'Status']
          title = 'Asset Inventory'
          break
        
        case 'summary':
          data = await prepareSummaryData(options)
          headers = ['Metric', 'Value']
          title = 'Financial Summary'
          break
      }

      progress.value = 95

      // Generate file based on format
      switch (options.format) {
        case 'excel':
          await exportToExcel(data, headers, title, options)
          break
        
        case 'pdf':
          await exportToPDF(data, headers, title, options)
          break
        
        case 'csv':
          await exportToCSV(data, headers, options)
          break
      }

      progress.value = 100
      clearInterval(progressInterval)

      // Show success message
      toast.success('Export completed successfully', {
        description: `Your ${options.format.toUpperCase()} file has been downloaded.`
      })

    } catch (err) {
      error.value = 'Failed to export data'
      console.error('Export error:', err)
      toast.error('Export failed', {
        description: 'There was an error exporting your data. Please try again.'
      })
    } finally {
      loading.value = false
      setTimeout(() => {
        progress.value = 0
      }, 1000)
    }
  }

  const prepareTransactionData = async (options: ExportOptions) => {
    // In a real app, this would fetch from API
    // For now, return mock data
    return [
      {
        date: '2024-01-15',
        type: 'INCOME',
        category: 'Salary',
        description: 'Monthly salary',
        amount: 15000000,
        tags: ['salary', 'january']
      },
      {
        date: '2024-01-14',
        type: 'EXPENSE',
        category: 'Food',
        description: 'Grocery shopping',
        amount: -850000,
        tags: ['groceries', 'food']
      },
      {
        date: '2024-01-13',
        type: 'EXPENSE',
        category: 'Transportation',
        description: 'Gasoline',
        amount: -450000,
        tags: ['transportation', 'fuel']
      }
    ]
  }

  const prepareInvestmentData = async (options: ExportOptions) => {
    return [
      {
        name: 'Apple Inc.',
        type: 'STOCK',
        symbol: 'AAPL',
        purchasePrice: 150,
        currentPrice: 175,
        quantity: 10,
        totalInvested: 150000000,
        currentValue: 175000000,
        return: 16.67
      },
      {
        name: 'Bitcoin',
        type: 'CRYPTO',
        symbol: 'BTC',
        purchasePrice: 45000,
        currentPrice: 52000,
        quantity: 0.5,
        totalInvested: 225000000,
        currentValue: 260000000,
        return: 15.56
      }
    ]
  }

  const prepareDebtData = async (options: ExportOptions) => {
    return [
      {
        lender: 'Bank Mandiri',
        principalAmount: 500000000,
        currentBalance: 450000000,
        interestRate: 8.5,
        monthlyPayment: 5500000,
        nextPaymentDate: '2024-02-01',
        status: 'ACTIVE'
      },
      {
        lender: 'BCA',
        principalAmount: 200000000,
        currentBalance: 180000000,
        interestRate: 9.0,
        monthlyPayment: 2500000,
        nextPaymentDate: '2024-02-15',
        status: 'ACTIVE'
      }
    ]
  }

  const prepareAssetData = async (options: ExportOptions) => {
    return [
      {
        name: 'Toyota Camry',
        type: 'VEHICLE',
        purchasePrice: 450000000,
        currentValue: 380000000,
        purchaseDate: '2022-03-15',
        location: 'Jakarta',
        status: 'ACTIVE'
      },
      {
        name: 'MacBook Pro',
        type: 'DIGITAL_ASSET',
        purchasePrice: 35000000,
        currentValue: 25000000,
        purchaseDate: '2023-06-10',
        location: 'Home Office',
        status: 'ACTIVE'
      }
    ]
  }

  const prepareSummaryData = async (options: ExportOptions) => {
    return [
      { metric: 'Total Income', value: 150000000 },
      { metric: 'Total Expenses', value: 85000000 },
      { metric: 'Net Cash Flow', value: 65000000 },
      { metric: 'Total Investments', value: 435000000 },
      { metric: 'Total Assets', value: 405000000 },
      { metric: 'Total Debts', value: 630000000 },
      { metric: 'Net Worth', value: -225000000 }
    ]
  }

  const exportToCSV = async (data: any[], headers: string[], options: ExportOptions) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header.toLowerCase().replace(/\s+/g, '')] || 
                       row[header] || 
                       row[Object.keys(row).find(key => key.toLowerCase().includes(header.toLowerCase())) || ''] ||
                       ''
          return typeof value === 'string' ? `"${value}"` : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const fileName = options.fileName || `finance-${options.dataType}-${new Date().toISOString().split('T')[0]}.csv`
    
    downloadFile(blob, fileName)
  }

  const exportToExcel = async (data: any[], headers: string[], title: string, options: ExportOptions) => {
    // For Excel export, we'll use a simple HTML table approach
    // In a real app, you'd use a library like SheetJS
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .date-range { font-size: 12px; color: #666; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="title">${title}</div>
        ${options.dateRange ? `<div class="date-range">Period: ${options.dateRange.start.toLocaleDateString()} - ${options.dateRange.end.toLocaleDateString()}</div>` : ''}
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => 
              `<tr>${headers.map(header => {
                const value = row[header.toLowerCase().replace(/\s+/g, '')] || 
                             row[header] || 
                             row[Object.keys(row).find(key => key.toLowerCase().includes(header.toLowerCase())) || ''] ||
                             ''
                return `<td>${value}</td>`
              }).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const fileName = options.fileName || `finance-${options.dataType}-${new Date().toISOString().split('T')[0]}.xls`
    
    downloadFile(blob, fileName)
  }

  const exportToPDF = async (data: any[], headers: string[], title: string, options: ExportOptions) => {
    // For PDF export, we'll use a simple approach with jsPDF
    // In a real app, you'd use a more sophisticated PDF library
    
    // Check if pdfMake is available (loaded in nuxt.config.ts)
    if (typeof (window as any).pdfMake === 'undefined') {
      throw new Error('PDF library not loaded')
    }

    const pdfMake = (window as any).pdfMake

    const documentDefinition = {
      content: [
        { text: title, style: 'header' },
        ...(options.dateRange ? [{
          text: `Period: ${options.dateRange.start.toLocaleDateString()} - ${options.dateRange.end.toLocaleDateString()}`,
          style: 'subheader'
        }] : []),
        {
          table: {
            headerRows: 1,
            widths: Array(headers.length).fill('*'),
            body: [
              headers.map(header => ({ text: header, style: 'tableHeader' })),
              ...data.map(row => 
                headers.map(header => {
                  const value = row[header.toLowerCase().replace(/\s+/g, '')] || 
                               row[header] || 
                               row[Object.keys(row).find(key => key.toLowerCase().includes(header.toLowerCase())) || ''] ||
                               ''
                  return { text: String(value), style: 'tableCell' }
                })
              )
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 12,
          italics: true,
          margin: [0, 0, 0, 15],
          color: '#666'
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black',
          fillColor: '#f2f2f2'
        },
        tableCell: {
          fontSize: 10,
          margin: [0, 5, 0, 5]
        }
      }
    }

    const fileName = options.fileName || `finance-${options.dataType}-${new Date().toISOString().split('T')[0]}.pdf`
    
    // Generate and download PDF
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition)
    pdfDocGenerator.download(fileName)
  }

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    progress: readonly(progress),
    exportData
  }
}