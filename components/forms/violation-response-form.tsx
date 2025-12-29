'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface ViolationResponseFormProps {
  violationId: string
  onSubmit: (data: { message: string; isInternal: boolean }) => Promise<any>
  isLoading?: boolean
  canCreateInternal?: boolean
}

export function ViolationResponseForm({
  violationId,
  onSubmit,
  isLoading,
  canCreateInternal = false,
}: ViolationResponseFormProps) {
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    await onSubmit({ message: message.trim(), isInternal })
    setMessage('')
    setIsInternal(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Add Response</Label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
          maxLength={2000}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Type your response..."
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {message.length} / 2000 characters
          </p>
        </div>
      </div>

      {canCreateInternal && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isInternal"
            checked={isInternal}
            onCheckedChange={(checked) => setIsInternal(checked === true)}
          />
          <label
            htmlFor="isInternal"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Internal note (only visible to admins)
          </label>
        </div>
      )}

      <Button type="submit" disabled={isLoading || !message.trim()}>
        {isLoading ? 'Submitting...' : 'Submit Response'}
      </Button>
    </form>
  )
}
