'use client'

import Link from 'next/link'
import { MaintenanceCategory, Urgency, MaintenanceStatus } from '@prisma/client'
import { Wrench, MessageSquare } from 'lucide-react'
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

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  category: MaintenanceCategory
  urgency: Urgency
  status: MaintenanceStatus
  location: string | null
  createdAt: Date
  completedAt: Date | null
  unit: {
    id: string
    address: string
  }
  createdBy: {
    firstName: string
    lastName: string
  }
  assignedTo: {
    firstName: string
    lastName: string
  } | null
  updateCount: number
}

interface MaintenanceRequestsTableProps {
  requests: MaintenanceRequest[]
  showUnit?: boolean
}

export function MaintenanceRequestsTable({
  requests,
  showUnit = true,
}: MaintenanceRequestsTableProps) {
  const getUrgencyBadge = (urgency: Urgency) => {
    switch (urgency) {
      case Urgency.LOW:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Low
          </Badge>
        )
      case Urgency.MEDIUM:
        return (
          <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
            Medium
          </Badge>
        )
      case Urgency.HIGH:
        return (
          <Badge variant="warning" className="bg-orange-100 text-orange-800">
            High
          </Badge>
        )
      case Urgency.EMERGENCY:
        return <Badge variant="destructive">Emergency</Badge>
    }
  }

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SUBMITTED:
        return <Badge variant="secondary">Submitted</Badge>
      case MaintenanceStatus.IN_REVIEW:
        return <Badge variant="secondary">In Review</Badge>
      case MaintenanceStatus.IN_PROGRESS:
        return <Badge variant="warning">In Progress</Badge>
      case MaintenanceStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>
      case MaintenanceStatus.DECLINED:
        return <Badge variant="outline">Declined</Badge>
    }
  }

  const getCategoryDisplay = (category: MaintenanceCategory) => {
    return category.replace(/_/g, ' ')
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No requests found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No maintenance requests match your current filters
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            {showUnit && <TableHead>Unit</TableHead>}
            <TableHead>Category</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div>
                  <Link
                    href={`/maintenance/${request.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {request.title}
                  </Link>
                  {request.location && (
                    <p className="text-xs text-muted-foreground">
                      {request.location}
                    </p>
                  )}
                  {request.updateCount > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {request.updateCount}{' '}
                      {request.updateCount === 1 ? 'update' : 'updates'}
                    </div>
                  )}
                </div>
              </TableCell>
              {showUnit && (
                <TableCell>
                  <Link
                    href={`/units/${request.unit.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {request.unit.address}
                  </Link>
                </TableCell>
              )}
              <TableCell className="text-sm">
                {getCategoryDisplay(request.category)}
              </TableCell>
              <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {request.assignedTo ? (
                  `${request.assignedTo.firstName} ${request.assignedTo.lastName}`
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {new Date(request.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/maintenance/${request.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
