'use client'

import { useState } from 'react'
import { MaintenanceCategory, MaintenancePriority } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MaintenanceRequestFormProps {
  unitId?: string
  unitAddress?: string
  request?: {
    id: string
    title: string
    description: string
    category: MaintenanceCategory
    priority: MaintenancePriority
    location?: string | null
  }
  onSubmit: (data: MaintenanceRequestFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface MaintenanceRequestFormData {
  unitId: string
  title: string
  description: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  location?: string
}

export function MaintenanceRequestForm({
  unitId: initialUnitId,
  unitAddress,
  request,
  onSubmit,
  onCancel,
  isLoading,
}: MaintenanceRequestFormProps) {
  const [formData, setFormData] = useState<MaintenanceRequestFormData>({
    unitId: initialUnitId || request?.id || '',
    title: request?.title || '',
    description: request?.description || '',
    category: request?.category || MaintenanceCategory.GENERAL,
    priority: request?.priority || MaintenancePriority.MEDIUM,
    location: request?.location || '',
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const getPriorityColor = (priority: MaintenancePriority) => {
    switch (priority) {
      case MaintenancePriority.LOW:
        return 'text-blue-600'
      case MaintenancePriority.MEDIUM:
        return 'text-yellow-600'
      case MaintenancePriority.HIGH:
        return 'text-orange-600'
      case MaintenancePriority.URGENT:
        return 'text-red-600'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {request ? 'Edit Request' : 'Submit Maintenance Request'}
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
              placeholder="e.g., Leaky faucet in kitchen"
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={MaintenanceCategory.PLUMBING}>Plumbing</option>
              <option value={MaintenanceCategory.ELECTRICAL}>Electrical</option>
              <option value={MaintenanceCategory.HVAC}>HVAC</option>
              <option value={MaintenanceCategory.APPLIANCE}>Appliance</option>
              <option value={MaintenanceCategory.STRUCTURAL}>Structural</option>
              <option value={MaintenanceCategory.EXTERIOR}>Exterior</option>
              <option value={MaintenanceCategory.LANDSCAPING}>Landscaping</option>
              <option value={MaintenanceCategory.PEST_CONTROL}>Pest Control</option>
              <option value={MaintenanceCategory.GENERAL}>General</option>
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority <span className="text-red-500">*</span>
            </Label>
            <select
              id="priority"
              name="priority"
              required
              value={formData.priority}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={MaintenancePriority.LOW}>
                Low - Can wait
              </option>
              <option value={MaintenancePriority.MEDIUM}>
                Medium - Normal timeline
              </option>
              <option value={MaintenancePriority.HIGH}>
                High - Needs attention soon
              </option>
              <option value={MaintenancePriority.URGENT}>
                Urgent - Immediate attention required
              </option>
            </select>
            <p className="text-sm text-muted-foreground">
              Current priority:{' '}
              <span className={`font-medium ${getPriorityColor(formData.priority)}`}>
                {formData.priority}
              </span>
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Specific Location (Optional)</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Master bathroom, 2nd floor"
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
              placeholder="Provide detailed information about the issue..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? request
              ? 'Updating...'
              : 'Submitting...'
            : request
            ? 'Update Request'
            : 'Submit Request'}
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
