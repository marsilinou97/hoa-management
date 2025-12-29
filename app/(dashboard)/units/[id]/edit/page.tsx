'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UnitForm } from '@/components/forms/unit-form'

export default function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  // TODO: Replace with actual tRPC query
  const unit = null
  const isLoading = false

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Call tRPC mutation
      console.log('Updating unit:', { id, data })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to unit detail
      router.push(`/units/${id}`)
    } catch (error) {
      console.error('Failed to update unit:', error)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!unit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/units">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Unit Not Found</h1>
          </div>
        </div>
      </div>
    )
  }

  // Placeholder data
  const unitData = {
    id,
    address: '123 Main St, Unit 101',
    ownerName: 'John Smith',
    ownerEmail: 'john@example.com',
    ownerPhone: '(555) 123-4567',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    notes: '',
    isActive: true,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/units/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Unit</h1>
          <p className="text-muted-foreground">
            Update unit information
          </p>
        </div>
      </div>

      <UnitForm initialData={unitData} onSubmit={handleSubmit} />
    </div>
  )
}
