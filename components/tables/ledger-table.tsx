'use client'

import { useState } from 'react'
import { LedgerEntry, LedgerEntryType, PaymentMethod } from '@prisma/client'
import { DollarSign, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/balance'
import { PaymentForm, PaymentFormData } from '@/components/forms/payment-form'
import { trpc } from '@/app/_trpc/client'

interface LedgerEntryWithBalance extends LedgerEntry {
  runningBalance: number
  createdBy: {
    firstName: string
    lastName: string
  }
}

interface LedgerTableProps {
  unitId: string
  unitAddress: string
  entries: LedgerEntryWithBalance[]
  balance: number
  onRefresh?: () => void
  isAdmin?: boolean
}

export function LedgerTable({
  unitId,
  unitAddress,
  entries,
  balance,
  onRefresh,
  isAdmin = false,
}: LedgerTableProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const logPayment = trpc.ledger.logPayment.useMutation({
    onSuccess: () => {
      setShowPaymentForm(false)
      onRefresh?.()
    },
  })

  const { refetch: exportCSV, isFetching: isExporting } =
    trpc.ledger.exportCSV.useQuery(
      { unitId },
      {
        enabled: false, // Don't run automatically
      }
    )

  const handleExportCSV = async () => {
    const { data } = await exportCSV()
    if (!data) return

    // Convert to CSV string
    const csvContent = [
      data.headers.join(','),
      ...data.rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `ledger-${unitAddress.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleLogPayment = async (data: PaymentFormData) => {
    await logPayment.mutateAsync({
      unitId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      date: data.date,
    })
  }

  const getEntryTypeBadge = (type: LedgerEntryType) => {
    switch (type) {
      case LedgerEntryType.PAYMENT:
        return <Badge variant="success">Payment</Badge>
      case LedgerEntryType.ASSESSMENT:
        return <Badge variant="default">Assessment</Badge>
      case LedgerEntryType.LATE_FEE:
        return <Badge variant="destructive">Late Fee</Badge>
      case LedgerEntryType.VIOLATION_FINE:
        return <Badge variant="destructive">Fine</Badge>
      case LedgerEntryType.SPECIAL_ASSESSMENT:
        return <Badge variant="warning">Special</Badge>
      case LedgerEntryType.ADJUSTMENT:
        return <Badge variant="secondary">Adjustment</Badge>
      case LedgerEntryType.CREDIT:
        return <Badge variant="success">Credit</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const isCharge = (type: LedgerEntryType) => {
    return [
      LedgerEntryType.ASSESSMENT,
      LedgerEntryType.LATE_FEE,
      LedgerEntryType.VIOLATION_FINE,
      LedgerEntryType.SPECIAL_ASSESSMENT,
    ].includes(type)
  }

  const isCredit = (type: LedgerEntryType) => {
    return [LedgerEntryType.PAYMENT, LedgerEntryType.CREDIT].includes(type)
  }

  if (showPaymentForm) {
    return (
      <PaymentForm
        unitId={unitId}
        unitAddress={unitAddress}
        currentBalance={balance}
        onSubmit={handleLogPayment}
        onCancel={() => setShowPaymentForm(false)}
        isLoading={logPayment.isLoading}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      {isAdmin && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={isExporting || entries.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button size="sm" onClick={() => setShowPaymentForm(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Log Payment
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No transactions yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Financial transactions will appear here
          </p>
          {isAdmin && (
            <Button className="mt-4" onClick={() => setShowPaymentForm(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Log First Payment
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Charge</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(entry.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getEntryTypeBadge(entry.type)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      )}
                      {entry.paymentMethod && (
                        <p className="text-xs text-muted-foreground">
                          via {entry.paymentMethod}
                          {entry.referenceNumber && ` #${entry.referenceNumber}`}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isCharge(entry.type) && (
                      <span className="font-medium text-red-600">
                        {formatCurrency(Number(entry.amount))}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isCredit(entry.type) && (
                      <span className="font-medium text-green-600">
                        {formatCurrency(Number(entry.amount))}
                      </span>
                    )}
                    {entry.type === LedgerEntryType.ADJUSTMENT &&
                      Number(entry.amount) < 0 && (
                        <span className="font-medium text-green-600">
                          {formatCurrency(Math.abs(Number(entry.amount)))}
                        </span>
                      )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        entry.runningBalance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {formatCurrency(entry.runningBalance)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary */}
      {entries.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <span className="text-sm font-medium">Current Balance</span>
          <span
            className={`text-xl font-bold ${
              balance > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      )}
    </div>
  )
}
