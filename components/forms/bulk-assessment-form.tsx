'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/app/client'
import { Checkbox } from '@/components/ui/checkbox'

interface Unit {
  id: string
  address: string
  isActive: boolean
}

interface BulkAssessmentFormProps {
  units: Unit[]
  onSuccess?: () => void
  onCancel: () => void
}

export function BulkAssessmentForm({
  units,
  onSuccess,
  onCancel,
}: BulkAssessmentFormProps) {
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    units.filter((u) => u.isActive).map((u) => u.id)
  )
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('Monthly HOA Assessment')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const bulkAssessment = trpc.ledger.bulkAssessment.useMutation({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedUnits.length === 0) {
      alert('Please select at least one unit')
      return
    }

    await bulkAssessment.mutateAsync({
      unitIds: selectedUnits,
      amount: parseFloat(amount),
      description,
      date: new Date(date),
    })
  }

  const toggleAll = () => {
    if (selectedUnits.length === units.length) {
      setSelectedUnits([])
    } else {
      setSelectedUnits(units.map((u) => u.id))
    }
  }

  const toggleUnit = (unitId: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Bulk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount per Unit <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Monthly HOA Assessment"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Assessment Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Unit Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Select Units <span className="text-red-500">*</span>
              </Label>
              <Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
                {selectedUnits.length === units.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-md border p-4">
              <div className="space-y-2">
                {units.map((unit) => (
                  <div key={unit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={unit.id}
                      checked={selectedUnits.includes(unit.id)}
                      onCheckedChange={() => toggleUnit(unit.id)}
                    />
                    <label
                      htmlFor={unit.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {unit.address}
                      {!unit.isActive && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Inactive)
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedUnits.length} unit{selectedUnits.length !== 1 ? 's' : ''} selected
              {amount && selectedUnits.length > 0 && (
                <>
                  {' '}
                  • Total: ${(parseFloat(amount) * selectedUnits.length).toFixed(2)}
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={bulkAssessment.isPending || selectedUnits.length === 0}
        >
          {bulkAssessment.isPending
            ? 'Creating Assessments...'
            : `Create ${selectedUnits.length} Assessment${selectedUnits.length !== 1 ? 's' : ''}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={bulkAssessment.isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
