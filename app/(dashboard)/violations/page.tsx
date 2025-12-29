'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ViolationsTable } from '@/components/tables/violations-table'
import { trpc } from '@/app/_trpc/client'
import { ViolationSeverity, ViolationStatus } from '@prisma/client'

export default function ViolationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ViolationStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<ViolationSeverity | 'all'>('all')

  const { data, isLoading } = trpc.violations.list.useQuery({
    search,
    status: statusFilter === 'all' ? undefined : statusFilter,
    severity: severityFilter === 'all' ? undefined : severityFilter,
  })

  const { data: stats } = trpc.violations.getStats.useQuery()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Violations</h1>
          <p className="text-muted-foreground">
            Track and manage community violations
          </p>
        </div>
        <Link href="/violations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report Violation
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.open} open, {stats.acknowledged} acknowledged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <AlertTriangle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dismissed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Violations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Violations</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search violations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value={ViolationStatus.OPEN}>Open</option>
              <option value={ViolationStatus.ACKNOWLEDGED}>Acknowledged</option>
              <option value={ViolationStatus.RESOLVED}>Resolved</option>
              <option value={ViolationStatus.DISMISSED}>Dismissed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Severities</option>
              <option value={ViolationSeverity.LOW}>Low</option>
              <option value={ViolationSeverity.MEDIUM}>Medium</option>
              <option value={ViolationSeverity.HIGH}>High</option>
              <option value={ViolationSeverity.CRITICAL}>Critical</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading violations...
            </div>
          ) : (
            <ViolationsTable
              violations={data?.violations ?? []}
              showUnit={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
