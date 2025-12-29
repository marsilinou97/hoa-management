'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UnitFormProps {
  initialData?: {
    id?: string
    address: string
    ownerName?: string
    ownerEmail?: string
    ownerPhone?: string
    tenantName?: string
    tenantEmail?: string
    tenantPhone?: string
    notes?: string
    isActive?: boolean
  }
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function UnitForm({ initialData, onSubmit, isLoading }: UnitFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    ownerName: initialData?.ownerName || '',
    ownerEmail: initialData?.ownerEmail || '',
    ownerPhone: initialData?.ownerPhone || '',
    tenantName: initialData?.tenantName || '',
    tenantEmail: initialData?.tenantEmail || '',
    tenantPhone: initialData?.tenantPhone || '',
    notes: initialData?.notes || '',
    isActive: initialData?.isActive ?? true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
          <CardTitle>Unit Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">
              Unit Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g., Unit 101, 123 Oak Street"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive">Active Unit</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="John Smith"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="owner@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerPhone">Owner Phone</Label>
              <Input
                id="ownerPhone"
                name="ownerPhone"
                type="tel"
                value={formData.ownerPhone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Information (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">Tenant Name</Label>
            <Input
              id="tenantName"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenantEmail">Tenant Email</Label>
              <Input
                id="tenantEmail"
                name="tenantEmail"
                type="email"
                value={formData.tenantEmail}
                onChange={handleChange}
                placeholder="tenant@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantPhone">Tenant Phone</Label>
              <Input
                id="tenantPhone"
                name="tenantPhone"
                type="tel"
                value={formData.tenantPhone}
                onChange={handleChange}
                placeholder="(555) 987-6543"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Admin Only)</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional information about this unit..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Unit' : 'Create Unit'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
