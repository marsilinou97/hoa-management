import { LedgerEntry, LedgerEntryType } from '@prisma/client'

/**
 * Utility functions for calculating unit balances
 */

/**
 * Calculate the current balance for a unit based on ledger entries
 * Positive amounts are charges (ASSESSMENT, LATE_FEE, VIOLATION_FINE, SPECIAL_ASSESSMENT, ADJUSTMENT)
 * Negative amounts are credits (PAYMENT, CREDIT)
 */
export function calculateBalance(entries: LedgerEntry[]): number {
  return entries.reduce((balance, entry) => {
    const amount = Number(entry.amount)

    // Charges increase balance
    if ([
      LedgerEntryType.ASSESSMENT,
      LedgerEntryType.LATE_FEE,
      LedgerEntryType.VIOLATION_FINE,
      LedgerEntryType.SPECIAL_ASSESSMENT,
    ].includes(entry.type)) {
      return balance + amount
    }

    // Payments and credits decrease balance
    if ([
      LedgerEntryType.PAYMENT,
      LedgerEntryType.CREDIT,
    ].includes(entry.type)) {
      return balance - amount
    }

    // Adjustments can be positive or negative
    if (entry.type === LedgerEntryType.ADJUSTMENT) {
      return balance + amount
    }

    return balance
  }, 0)
}

/**
 * Calculate running balance for display in ledger
 */
export function calculateRunningBalance(entries: LedgerEntry[]): Array<LedgerEntry & { runningBalance: number }> {
  let runningBalance = 0

  return entries.map(entry => {
    const amount = Number(entry.amount)

    if ([
      LedgerEntryType.ASSESSMENT,
      LedgerEntryType.LATE_FEE,
      LedgerEntryType.VIOLATION_FINE,
      LedgerEntryType.SPECIAL_ASSESSMENT,
    ].includes(entry.type)) {
      runningBalance += amount
    } else if ([
      LedgerEntryType.PAYMENT,
      LedgerEntryType.CREDIT,
    ].includes(entry.type)) {
      runningBalance -= amount
    } else if (entry.type === LedgerEntryType.ADJUSTMENT) {
      runningBalance += amount
    }

    return {
      ...entry,
      runningBalance,
    }
  })
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Determine if a balance is overdue (placeholder - will be enhanced later)
 */
export function isBalanceOverdue(balance: number, gracePeriodDays: number = 15): boolean {
  // For now, simple check - later we'll check against due dates
  return balance > 0
}
