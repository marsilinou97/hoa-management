'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViolationForm, ViolationFormData } from '@/components/forms/violation-form'
import { trpc } from '@/app/_trpc/client'
import { Suspense } from 'react'

function NewViolationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const unitId = searchParams.get('unitId')

  const { data: unit } = trpc.units.get.useQuery(
    { id: unitId! },
    { enabled: !!unitId }
  )

  const createViolation = trpc.violations.create.useMutation({
    onSuccess: (data) => {
      router.push(`/violations/${data.id}`)
    },
  })

  const handleSubmit = async (data: ViolationFormData) => {
    await createViolation.mutateAsync({
      unitId: data.unitId,
      title: data.title,
      description: data.description,
      severity: data.severity,
      fineAmount: data.fineAmount,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/violations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Violation</h1>
          <p className="text-muted-foreground">
            Create a new violation report for a unit
          </p>
        </div>
      </div>

      <ViolationForm
        unitId={unitId || undefined}
        unitAddress={unit?.address}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/violations')}
        isLoading={createViolation.isPending}
      />
    </div>
  )
}

export default function NewViolationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewViolationContent />
    </Suspense>
  )
}
