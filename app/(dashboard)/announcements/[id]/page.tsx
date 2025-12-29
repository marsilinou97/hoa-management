'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Pin, PinOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/app/_trpc/client'
import { useRouter } from 'next/navigation'

export default function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data: announcement, isLoading, refetch } = trpc.announcements.get.useQuery({ id })

  const deleteAnnouncement = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      router.push('/announcements')
    },
  })

  const togglePin = trpc.announcements.togglePin.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await deleteAnnouncement.mutateAsync({ id })
    }
  }

  const handleTogglePin = async () => {
    await togglePin.mutateAsync({
      id,
      isPinned: !announcement?.isPinned,
    })
  }

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!announcement) return <div className="p-6">Announcement not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/announcements">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{announcement.title}</h1>
            {announcement.isPinned && (
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">
                  <Pin className="mr-1 h-3 w-3" fill="currentColor" />
                  Pinned
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePin}
            disabled={togglePin.isLoading}
          >
            {announcement.isPinned ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                Pin
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteAnnouncement.isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Announcement</CardTitle>
            <div className="text-sm text-muted-foreground">
              Posted by {announcement.createdBy.firstName} {announcement.createdBy.lastName} on{' '}
              {new Date(announcement.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm">{announcement.content}</div>
        </CardContent>
      </Card>
    </div>
  )
}
