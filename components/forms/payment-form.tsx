'use client'

import { useState } from 'react'
import { PaymentMethod } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentFormProps {
  unitId: string
  unitAddress: string
  currentBalance: number
  onSubmit: (data: PaymentFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface PaymentFormData {
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  notes?: string
  date?: Date
}

export function PaymentForm({
  unitId,
  unitAddress,
  currentBalance,
  onSubmit,
  onCancel,
  isLoading,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: currentBalance > 0 ? currentBalance : 0,
    paymentMethod: PaymentMethod.CHECK,
    referenceNumber: '',
    notes: '',
    date: new Date(),
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
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
          <CardTitle>Log Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              <strong>Unit:</strong> {unitAddress}
            </p>
            <p className="text-sm">
              <strong>Current Balance:</strong>{' '}
              <span className={currentBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                ${currentBalance.toFixed(2)}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={handleChange}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            {currentBalance > 0 && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, amount: currentBalance }))}
                className="text-xs text-primary hover:underline"
              >
                Use full balance (${currentBalance.toFixed(2)})
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              value={formData.paymentMethod}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={PaymentMethod.CHECK}>Check</option>
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PaymentMethod.ONLINE}>Online Payment</option>
              <option value={PaymentMethod.OTHER}>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">
              Reference/Check Number
            </Label>
            <Input
              id="referenceNumber"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="Check #1234 or Transaction ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date?.toISOString().split('T')[0]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  date: e.target.value ? new Date(e.target.value) : new Date(),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional notes..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || formData.amount <= 0}>
          {isLoading ? 'Logging Payment...' : 'Log Payment'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
