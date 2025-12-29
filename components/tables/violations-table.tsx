'use client'

import Link from 'next/link'
import { ViolationSeverity, ViolationStatus } from '@prisma/client'
import { AlertTriangle, MessageSquare } from 'lucide-react'
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

interface Violation {
  id: string
  title: string
  description: string
  severity: ViolationSeverity
  status: ViolationStatus
  fineAmount: number | null
  reportedAt: Date
  resolvedAt: Date | null
  unit: {
    id: string
    address: string
  }
  createdBy: {
    firstName: string
    lastName: string
  }
  responseCount: number
}

interface ViolationsTableProps {
  violations: Violation[]
  showUnit?: boolean
}

export function ViolationsTable({
  violations,
  showUnit = true,
}: ViolationsTableProps) {
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

  if (violations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No violations found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No violations match your current filters
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
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fine</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {violations.map((violation) => (
            <TableRow key={violation.id}>
              <TableCell>
                <div>
                  <Link
                    href={`/violations/${violation.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {violation.title}
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {violation.description}
                  </p>
                  {violation.responseCount > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {violation.responseCount}{' '}
                      {violation.responseCount === 1 ? 'response' : 'responses'}
                    </div>
                  )}
                </div>
              </TableCell>
              {showUnit && (
                <TableCell>
                  <Link
                    href={`/units/${violation.unit.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {violation.unit.address}
                  </Link>
                </TableCell>
              )}
              <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
              <TableCell>{getStatusBadge(violation.status)}</TableCell>
              <TableCell>
                {violation.fineAmount ? (
                  <span className="font-medium text-red-600">
                    {formatCurrency(Number(violation.fineAmount))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {new Date(violation.reportedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/violations/${violation.id}`}>
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
