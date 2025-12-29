'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, DollarSign, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/app/client'
import { ViolationResponseForm } from '@/components/forms/violation-response-form'
import { ViolationSeverity, ViolationStatus } from '@prisma/client'
import { formatCurrency } from '@/lib/utils/balance'
import { useRouter } from 'next/navigation'

export default function ViolationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [statusUpdate, setStatusUpdate] = useState<ViolationStatus | null>(null)

  const { data: violation, isLoading, refetch } = trpc.violations.get.useQuery({ id })

  const submitResponse = trpc.violations.submitResponse.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const updateViolation = trpc.violations.update.useMutation({
    onSuccess: () => {
      refetch()
      setStatusUpdate(null)
    },
  })

  const deleteViolation = trpc.violations.delete.useMutation({
    onSuccess: () => {
      router.push('/violations')
    },
  })

  const handleStatusChange = async (status: ViolationStatus) => {
    await updateViolation.mutateAsync({
      id,
      status,
    })
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this violation?')) {
      await deleteViolation.mutateAsync({ id })
    }
  }

  const getSeverityBadge = (severity: ViolationSeverity) => {
    switch (severity) {
      case ViolationSeverity.LOW:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Low
          </Badge>
        )
      case ViolationSeverity.MEDIUM:
        return (
          <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
            Medium
          </Badge>
        )
      case ViolationSeverity.HIGH:
        return (
          <Badge variant="warning" className="bg-orange-100 text-orange-800">
            High
          </Badge>
        )
      case ViolationSeverity.CRITICAL:
        return <Badge variant="destructive">Critical</Badge>
    }
  }

  const getStatusBadge = (status: ViolationStatus) => {
    switch (status) {
      case ViolationStatus.OPEN:
        return <Badge variant="destructive">Open</Badge>
      case ViolationStatus.ACKNOWLEDGED:
        return <Badge variant="warning">Acknowledged</Badge>
      case ViolationStatus.RESOLVED:
        return <Badge variant="success">Resolved</Badge>
      case ViolationStatus.DISMISSED:
        return <Badge variant="secondary">Dismissed</Badge>
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!violation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/violations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Violation Not Found
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/violations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {violation.title}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              {getSeverityBadge(violation.severity)}
              {getStatusBadge(violation.status)}
              <Link
                href={`/units/${violation.unit.id}`}
                className="text-sm text-primary hover:underline"
              >
                {violation.unit.address}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteViolation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          {/* Violation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {violation.description}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Reported Date</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(violation.reportedAt).toLocaleDateString()}
                  </p>
                </div>

                {violation.resolvedAt && (
                  <div>
                    <p className="text-sm font-medium">Resolved Date</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(violation.resolvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">Reported By</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {violation.createdBy.firstName} {violation.createdBy.lastName}
                  </p>
                </div>

                {violation.fineAmount && (
                  <div>
                    <p className="text-sm font-medium">Fine Amount</p>
                    <p className="mt-1 text-lg font-bold text-red-600">
                      {formatCurrency(Number(violation.fineAmount))}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Responses ({violation.responses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violation.responses.map((response) => (
                  <div
                    key={response.id}
                    className="rounded-lg border bg-muted/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {response.createdBy.firstName}{' '}
                          {response.createdBy.lastName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {response.createdBy.role}
                        </Badge>
                        {response.isInternal && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="mr-1 h-3 w-3" />
                            Internal
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(response.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {response.message}
                    </p>
                  </div>
                ))}

                {violation.responses.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No responses yet
                  </p>
                )}
              </div>

              <div className="mt-6">
                <ViolationResponseForm
                  violationId={id}
                  onSubmit={(data) =>
                    submitResponse.mutateAsync({
                      violationId: id,
                      message: data.message,
                      isInternal: data.isInternal,
                    })
                  }
                  isLoading={submitResponse.isPending}
                  canCreateInternal={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Unit Info */}
          <Card>
            <CardHeader>
              <CardTitle>Unit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Address</p>
                <Link
                  href={`/units/${violation.unit.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {violation.unit.address}
                </Link>
              </div>
              {violation.unit.ownerName && (
                <div>
                  <p className="text-sm font-medium">Owner</p>
                  <p className="text-sm text-muted-foreground">
                    {violation.unit.ownerName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">Change Status</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange(ViolationStatus.ACKNOWLEDGED)}
                  disabled={
                    violation.status === ViolationStatus.ACKNOWLEDGED ||
                    updateViolation.isPending
                  }
                >
                  Mark as Acknowledged
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange(ViolationStatus.RESOLVED)}
                  disabled={
                    violation.status === ViolationStatus.RESOLVED ||
                    updateViolation.isPending
                  }
                >
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange(ViolationStatus.DISMISSED)}
                  disabled={
                    violation.status === ViolationStatus.DISMISSED ||
                    updateViolation.isPending
                  }
                >
                  Dismiss Violation
                </Button>
              </div>

              {violation.ledgerEntry && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      Fine recorded in ledger
                    </span>
                  </div>
                  <Link
                    href={`/units/${violation.unit.id}?tab=ledger`}
                    className="mt-2 text-xs text-green-600 hover:underline"
                  >
                    View in ledger →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
