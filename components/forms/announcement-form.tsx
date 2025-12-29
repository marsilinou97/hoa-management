'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface AnnouncementFormProps {
  announcement?: {
    id: string
    title: string
    content: string
    isPinned: boolean
  }
  onSubmit: (data: AnnouncementFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface AnnouncementFormData {
  title: string
  content: string
  isPinned: boolean
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
    isPinned: announcement?.isPinned || false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

          {/* Pin Announcement */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPinned"
              checked={formData.isPinned}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPinned: checked as boolean }))
              }
            />
            <Label
              htmlFor="isPinned"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Pin this announcement to the top
            </Label>
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
