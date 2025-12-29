'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UnitForm } from '@/components/forms/unit-form'

export default function NewUnitPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Call tRPC mutation
      console.log('Creating unit:', data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to units list
      router.push('/units')
    } catch (error) {
      console.error('Failed to create unit:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/units">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Unit</h1>
          <p className="text-muted-foreground">
            Create a new unit in your community
          </p>
        </div>
      </div>

      <UnitForm onSubmit={handleSubmit} />
    </div>
  )
}
