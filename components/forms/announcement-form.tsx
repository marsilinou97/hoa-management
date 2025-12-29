'use client'

import { useState } from 'react'
import { AnnouncementPriority } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnnouncementFormProps {
  announcement?: {
    id: string
    title: string
    content: string
    priority: AnnouncementPriority
    expiresAt: Date | null
  }
  onSubmit: (data: AnnouncementFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface AnnouncementFormData {
  title: string
  content: string
  priority: AnnouncementPriority
  expiresAt?: Date | null
}

export function AnnouncementForm({
  announcement,
  onSubmit,
  onCancel,
  isLoading,
}: AnnouncementFormProps) {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: announcement?.title || '',
    content: announcement?.content || '',
    priority: announcement?.priority || AnnouncementPriority.NORMAL,
    expiresAt: announcement?.expiresAt || null,
  })

  const [expiresAtString, setExpiresAtString] = useState(
    announcement?.expiresAt
      ? new Date(announcement.expiresAt).toISOString().split('T')[0]
      : ''
  )

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    if (name === 'expiresAt') {
      setExpiresAtString(value)
      setFormData((prev) => ({
        ...prev,
        expiresAt: value ? new Date(value) : null,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case AnnouncementPriority.LOW:
        return 'text-blue-600'
      case AnnouncementPriority.NORMAL:
        return 'text-gray-600'
      case AnnouncementPriority.HIGH:
        return 'text-orange-600'
      case AnnouncementPriority.URGENT:
        return 'text-red-600'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {announcement ? 'Edit Announcement' : 'Create Announcement'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              placeholder="e.g., Pool Maintenance Scheduled"
              maxLength={200}
            />
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
              <option value={AnnouncementPriority.LOW}>
                Low - General information
              </option>
              <option value={AnnouncementPriority.NORMAL}>
                Normal - Standard announcement
              </option>
              <option value={AnnouncementPriority.HIGH}>
                High - Important notice
              </option>
              <option value={AnnouncementPriority.URGENT}>
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

          {/* Expires At */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              value={expiresAtString}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground">
              Leave blank for announcements that don't expire
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="content"
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Write your announcement here..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? announcement
              ? 'Updating...'
              : 'Creating...'
            : announcement
            ? 'Update Announcement'
            : 'Publish Announcement'}
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
