'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/app/_trpc/client'
import { MaintenanceStatus, Urgency } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'

export default function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [updateMessage, setUpdateMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const { data: request, isLoading, refetch } = trpc.maintenance.get.useQuery({ id })

  const addUpdate = trpc.maintenance.addUpdate.useMutation({
    onSuccess: () => {
      setUpdateMessage('')
      setIsInternal(false)
      refetch()
    },
  })

  const updateRequest = trpc.maintenance.update.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const deleteRequest = trpc.maintenance.delete.useMutation({
    onSuccess: () => {
      router.push('/maintenance')
    },
  })

  const handleStatusChange = async (status: MaintenanceStatus) => {
    await updateRequest.mutateAsync({ id, status })
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this request?')) {
      await deleteRequest.mutateAsync({ id })
    }
  }

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateMessage.trim()) return

    await addUpdate.mutateAsync({
      requestId: id,
      message: updateMessage.trim(),
      isInternal,
    })
  }

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!request) return <div className="p-6">Request not found</div>

  const getUrgencyBadge = (urgency: Urgency) => {
    switch (urgency) {
      case Urgency.LOW:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>
      case Urgency.MEDIUM:
        return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case Urgency.HIGH:
        return <Badge variant="warning" className="bg-orange-100 text-orange-800">High</Badge>
      case Urgency.EMERGENCY:
        return <Badge variant="destructive">Emergency</Badge>
    }
  }

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SUBMITTED:
        return <Badge variant="secondary">Submitted</Badge>
      case MaintenanceStatus.IN_REVIEW:
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">In Review</Badge>
      case MaintenanceStatus.IN_PROGRESS:
        return <Badge variant="warning">In Progress</Badge>
      case MaintenanceStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>
      case MaintenanceStatus.DECLINED:
        return <Badge variant="outline">Declined</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/maintenance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{request.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              {getUrgencyBadge(request.urgency)}
              {getStatusBadge(request.status)}
              <Link href={`/units/${request.unit.id}`} className="text-sm text-primary hover:underline">
                {request.unit.address}
              </Link>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleteRequest.isPending}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{request.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="mt-1 text-sm text-muted-foreground">{request.category.replace(/_/g, ' ')}</p>
                </div>
                {request.location && (
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="mt-1 text-sm text-muted-foreground">{request.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Created Date</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {request.completedAt && (
                  <div>
                    <p className="text-sm font-medium">Completed Date</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(request.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Requested By</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.createdBy.firstName} {request.createdBy.lastName}
                  </p>
                </div>
                {request.assignedTo && (
                  <div>
                    <p className="text-sm font-medium">Assigned To</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {request.assignedTo.firstName} {request.assignedTo.lastName}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Updates ({request.updates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.updates.map((update) => (
                  <div key={update.id} className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {update.createdBy.firstName} {update.createdBy.lastName}
                        </p>
                        <Badge variant="outline" className="text-xs">{update.createdBy.role}</Badge>
                        {update.isInternal && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="mr-1 h-3 w-3" />
                            Internal
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(update.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{update.message}</p>
                  </div>
                ))}
                {request.updates.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">No updates yet</p>
                )}
              </div>

              <form onSubmit={handleSubmitUpdate} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Add Update</Label>
                  <textarea
                    id="message"
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Type your update..."
                  />
                </div>
                <Button type="submit" disabled={addUpdate.isPending || !updateMessage.trim()}>
                  {addUpdate.isPending ? 'Submitting...' : 'Submit Update'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                  onClick={() => handleStatusChange(MaintenanceStatus.IN_REVIEW)}
                  disabled={request.status === MaintenanceStatus.IN_REVIEW || updateRequest.isPending}
                >
                  Mark In Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange(MaintenanceStatus.IN_PROGRESS)}
                  disabled={request.status === MaintenanceStatus.IN_PROGRESS || updateRequest.isPending}
                >
                  Mark In Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange(MaintenanceStatus.COMPLETED)}
                  disabled={request.status === MaintenanceStatus.COMPLETED || updateRequest.isPending}
                >
                  Mark Completed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange(MaintenanceStatus.DECLINED)}
                  disabled={request.status === MaintenanceStatus.DECLINED || updateRequest.isPending}
                >
                  Decline Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
