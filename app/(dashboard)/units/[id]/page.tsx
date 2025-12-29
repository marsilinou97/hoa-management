'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, DollarSign, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/balance'

export default function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // TODO: Replace with actual tRPC query
  const unit = null
  const isLoading = false

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!unit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/units">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Unit Not Found</h1>
          </div>
        </div>
      </div>
    )
  }

  // Placeholder data
  const unitData = {
    address: '123 Main St, Unit 101',
    ownerName: 'John Smith',
    ownerEmail: 'john@example.com',
    ownerPhone: '(555) 123-4567',
    tenantName: null,
    balance: 0,
    isActive: true,
    residents: [],
    violations: [],
    maintenanceRequests: [],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/units">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{unitData.address}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={unitData.isActive ? 'success' : 'secondary'}>
                {unitData.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Balance:{' '}
                <span className={unitData.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(unitData.balance)}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/units/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="violations">
            Violations {unitData.violations.length > 0 && `(${unitData.violations.length})`}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests {unitData.maintenanceRequests.length > 0 && `(${unitData.maintenanceRequests.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unitData.ownerName ? (
                  <>
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">{unitData.ownerName}</p>
                    </div>
                    {unitData.ownerEmail && (
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{unitData.ownerEmail}</p>
                      </div>
                    )}
                    {unitData.ownerPhone && (
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{unitData.ownerPhone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No owner information</p>
                )}
              </CardContent>
            </Card>

            {/* Tenant Information */}
            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
              </CardHeader>
              <CardContent>
                {unitData.tenantName ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">{unitData.tenantName}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tenant</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Current Balance</span>
                  <span className={`text-2xl font-bold ${unitData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(unitData.balance)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Log Payment
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reminder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registered Residents */}
          {unitData.residents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Registered Residents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unitData.residents.map((resident: any) => (
                    <div key={resident.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{resident.firstName} {resident.lastName}</p>
                        <p className="text-sm text-muted-foreground">{resident.email}</p>
                      </div>
                      <Badge>{resident.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ledger Tab */}
        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle>Financial Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ledger functionality will be implemented in Phase 3
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No violations for this unit
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No maintenance requests for this unit
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
