'use client'

import { useState } from 'react'
import { ViolationSeverity } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ViolationFormProps {
  unitId?: string
  unitAddress?: string
  violation?: {
    id: string
    title: string
    description: string
    severity: ViolationSeverity
    fineAmount: number | null
  }
  onSubmit: (data: ViolationFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface ViolationFormData {
  unitId: string
  title: string
  description: string
  severity: ViolationSeverity
  fineAmount?: number
}

export function ViolationForm({
  unitId: initialUnitId,
  unitAddress,
  violation,
  onSubmit,
  onCancel,
  isLoading,
}: ViolationFormProps) {
  const [formData, setFormData] = useState<ViolationFormData>({
    unitId: initialUnitId || violation?.id || '',
    title: violation?.title || '',
    description: violation?.description || '',
    severity: violation?.severity || ViolationSeverity.MEDIUM,
    fineAmount: violation?.fineAmount ? Number(violation.fineAmount) : undefined,
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'fineAmount'
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const getSeverityColor = (severity: ViolationSeverity) => {
    switch (severity) {
      case ViolationSeverity.LOW:
        return 'text-blue-600'
      case ViolationSeverity.MEDIUM:
        return 'text-yellow-600'
      case ViolationSeverity.HIGH:
        return 'text-orange-600'
      case ViolationSeverity.CRITICAL:
        return 'text-red-600'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {violation ? 'Edit Violation' : 'Report Violation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unit Info (read-only if provided) */}
          {unitAddress && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                <strong>Unit:</strong> {unitAddress}
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Noise complaint, Parking violation"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide detailed information about the violation..."
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">
              Severity <span className="text-red-500">*</span>
            </Label>
            <select
              id="severity"
              name="severity"
              required
              value={formData.severity}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={ViolationSeverity.LOW}>
                Low - Minor issue
              </option>
              <option value={ViolationSeverity.MEDIUM}>
                Medium - Moderate concern
              </option>
              <option value={ViolationSeverity.HIGH}>
                High - Serious violation
              </option>
              <option value={ViolationSeverity.CRITICAL}>
                Critical - Urgent attention required
              </option>
            </select>
            <p className="text-sm text-muted-foreground">
              Current severity:{' '}
              <span className={`font-medium ${getSeverityColor(formData.severity)}`}>
                {formData.severity}
              </span>
            </p>
          </div>

          {/* Fine Amount */}
          <div className="space-y-2">
            <Label htmlFor="fineAmount">Fine Amount (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="fineAmount"
                name="fineAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.fineAmount ?? ''}
                onChange={handleChange}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will automatically create a charge in the unit's ledger
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? violation
              ? 'Updating...'
              : 'Creating...'
            : violation
            ? 'Update Violation'
            : 'Create Violation'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
