'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wrench, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MaintenanceRequestsTable } from '@/components/tables/maintenance-requests-table'
import { trpc } from '@/app/_trpc/client'
import { MaintenanceStatus, MaintenancePriority, MaintenanceCategory } from '@prisma/client'

export default function MaintenancePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | 'all'>('all')

  const { data, isLoading } = trpc.maintenance.list.useQuery({
    search,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  })

  const { data: stats } = trpc.maintenance.getStats.useQuery()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
          <p className="text-muted-foreground">
            Track and manage maintenance requests
          </p>
        </div>
        <Link href="/maintenance/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pending} pending, {stats.inProgress} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Wrench className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
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
              <option value={MaintenanceStatus.PENDING}>Pending</option>
              <option value={MaintenanceStatus.IN_PROGRESS}>In Progress</option>
              <option value={MaintenanceStatus.COMPLETED}>Completed</option>
              <option value={MaintenanceStatus.CANCELLED}>Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Priorities</option>
              <option value={MaintenancePriority.LOW}>Low</option>
              <option value={MaintenancePriority.MEDIUM}>Medium</option>
              <option value={MaintenancePriority.HIGH}>High</option>
              <option value={MaintenancePriority.URGENT}>Urgent</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading requests...
            </div>
          ) : (
            <MaintenanceRequestsTable
              requests={data?.requests ?? []}
              showUnit={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
