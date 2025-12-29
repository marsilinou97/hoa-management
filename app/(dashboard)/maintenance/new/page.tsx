'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaintenanceRequestForm, MaintenanceRequestFormData } from '@/components/forms/maintenance-request-form'
import { trpc } from '@/app/_trpc/client'
import { Suspense } from 'react'

function NewMaintenanceRequestContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const unitId = searchParams.get('unitId')

  const { data: unit } = trpc.units.get.useQuery(
    { id: unitId! },
    { enabled: !!unitId }
  )

  const createRequest = trpc.maintenance.create.useMutation({
    onSuccess: (data) => {
      router.push(`/maintenance/${data.id}`)
    },
  })

  const handleSubmit = async (data: MaintenanceRequestFormData) => {
    await createRequest.mutateAsync({
      unitId: data.unitId,
      title: data.title,
      description: data.description,
      category: data.category,
      urgency: data.urgency,
      location: data.location,
      photos: data.photos,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/maintenance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Maintenance Request</h1>
          <p className="text-muted-foreground">
            Submit a new maintenance request
          </p>
        </div>
      </div>

      <MaintenanceRequestForm
        unitId={unitId || undefined}
        unitAddress={unit?.address}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/maintenance')}
        isLoading={createRequest.isPending}
      />
    </div>
  )
}

export default function NewMaintenanceRequestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewMaintenanceRequestContent />
    </Suspense>
  )
}
