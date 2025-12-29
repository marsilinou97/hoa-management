'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Plus, Search, Mail } from 'lucide-react'
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

export default function ResidentsPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'SUPER_ADMIN' | 'ADMIN' | 'RESIDENT'>('all')

  // TODO: Replace with actual tRPC query
  const residents = []
  const isLoading = false

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Residents</h1>
          <p className="text-muted-foreground">
            Manage community members and residents
          </p>
        </div>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          Invite Resident
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Residents</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="RESIDENT">Resident</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading residents...
            </div>
          ) : residents.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No residents found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by inviting residents to your community.
              </p>
              <Button className="mt-4">
                <Mail className="mr-2 h-4 w-4" />
                Invite Resident
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((resident: any) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">
                      {resident.firstName} {resident.lastName}
                    </TableCell>
                    <TableCell>{resident.email}</TableCell>
                    <TableCell>
                      {resident.unit ? (
                        <Link href={`/units/${resident.unit.id}`} className="text-primary hover:underline">
                          {resident.unit.address}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={resident.role === 'RESIDENT' ? 'secondary' : 'default'}>
                        {resident.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/residents/${resident.id}`}>
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
