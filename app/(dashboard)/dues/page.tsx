'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, Download, Search, Send, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { trpc } from '@/app/client'
import { BulkAssessmentForm } from '@/components/forms/bulk-assessment-form'

export default function DuesPage() {
  const [search, setSearch] = useState('')
  const [showBulkAssessment, setShowBulkAssessment] = useState(false)

  const { data, isLoading, refetch } = trpc.ledger.getOutstandingBalances.useQuery()
  const { data: allUnits, isLoading: unitsLoading } = trpc.units.list.useQuery(
    { search: '', status: 'all', balanceFilter: 'all' },
    { enabled: showBulkAssessment }
  )
  const { refetch: exportCSV, isFetching: isExporting } =
    trpc.ledger.exportCSV.useQuery(
      {},
      {
        enabled: false,
      }
    )

  const handleExportAll = async () => {
    const { data: csvData } = await exportCSV()
    if (!csvData) return

    // Convert to CSV string
    const csvContent = [
      csvData.headers.join(','),
      ...csvData.rows.map((row) =>
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
      `community-ledger-${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredBalances =
    data?.balances.filter(
      (item) =>
        item.address.toLowerCase().includes(search.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(search.toLowerCase())
    ) ?? []

  if (showBulkAssessment) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Bulk Assessment</h1>
          <p className="text-muted-foreground">
            Charge multiple units at once (e.g., monthly HOA dues)
          </p>
        </div>
        {unitsLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading units...</div>
        ) : (
          <BulkAssessmentForm
            units={allUnits?.units ?? []}
            onSuccess={() => {
              setShowBulkAssessment(false)
              refetch()
            }}
            onCancel={() => setShowBulkAssessment(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dues & Payments</h1>
          <p className="text-muted-foreground">
            Track outstanding balances and payments across all units
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkAssessment(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Bulk Assessment
          </Button>
          <Button variant="outline" onClick={handleExportAll} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export All'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outstanding
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data?.totalOutstanding ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Units with Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.unitsWithBalance ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {data?.balances.length ?? 0} total units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.balances.length
                ? (
                    ((data.balances.length - (data.unitsWithBalance ?? 0)) /
                      data.balances.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">units paid in full</p>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Balances Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Outstanding Balances</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading balances...
            </div>
          ) : filteredBalances.length === 0 ? (
            <div className="py-8 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {search ? 'No units found' : 'All units paid in full'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {search
                  ? 'Try adjusting your search'
                  : 'There are no outstanding balances at this time.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBalances.map((item) => (
                    <TableRow key={item.unitId}>
                      <TableCell>
                        <Link
                          href={`/units/${item.unitId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {item.address}
                        </Link>
                      </TableCell>
                      <TableCell>{item.ownerName || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-medium ${
                            item.balance > 0
                              ? 'text-red-600'
                              : item.balance < 0
                              ? 'text-green-600'
                              : ''
                          }`}
                        >
                          {formatCurrency(item.balance)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/units/${item.unitId}?tab=ledger`}>
                            <Button variant="ghost" size="sm">
                              View Ledger
                            </Button>
                          </Link>
                          {item.balance > 0 && (
                            <Button variant="ghost" size="sm">
                              <Send className="mr-2 h-4 w-4" />
                              Send Reminder
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
