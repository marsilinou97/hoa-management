'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnnouncementForm, AnnouncementFormData } from '@/components/forms/announcement-form'
import { trpc } from '@/app/client'

export default function NewAnnouncementPage() {
  const router = useRouter()

  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: (data) => {
      router.push(`/announcements/${data.id}`)
    },
  })

  const handleSubmit = async (data: AnnouncementFormData) => {
    await createAnnouncement.mutateAsync({
      title: data.title,
      content: data.content,
      priority: data.priority,
      expiresAt: data.expiresAt,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/announcements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Announcement</h1>
          <p className="text-muted-foreground">Create a new community announcement</p>
        </div>
      </div>

      <AnnouncementForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/announcements')}
        isLoading={createAnnouncement.isPending}
      />
    </div>
  )
}
