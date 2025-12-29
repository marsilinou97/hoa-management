'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Plus, Search } from 'lucide-react'
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

export default function UnitsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'paid' | 'overdue'>('all')

  // TODO: Replace with actual tRPC query
  const units = []
  const isLoading = false

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units</h1>
          <p className="text-muted-foreground">
            Manage your community units and residents
          </p>
        </div>
        <Link href="/units/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Units</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by address or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value as any)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Balances</option>
                <option value="paid">Paid Up</option>
                <option value="overdue">Has Balance</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading units...
            </div>
          ) : units.length === 0 ? (
            <div className="py-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No units found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by adding your first unit.
              </p>
              <Link href="/units/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Owner/Resident</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit: any) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.address}</TableCell>
                    <TableCell>
                      {unit.residents.length > 0
                        ? `${unit.residents[0].firstName} ${unit.residents[0].lastName}`
                        : unit.ownerName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={unit.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(unit.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={unit.isActive ? 'success' : 'secondary'}>
                        {unit.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/units/${unit.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
