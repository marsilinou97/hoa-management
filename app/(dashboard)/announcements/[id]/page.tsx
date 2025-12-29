'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Archive, ArchiveRestore } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/app/_trpc/client'
import { AnnouncementPriority } from '@prisma/client'
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

  const toggleArchive = trpc.announcements.toggleArchive.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await deleteAnnouncement.mutateAsync({ id })
    }
  }

  const handleToggleArchive = async () => {
    await toggleArchive.mutateAsync({
      id,
      isArchived: !announcement?.isArchived,
    })
  }

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case AnnouncementPriority.LOW:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>
      case AnnouncementPriority.NORMAL:
        return <Badge variant="secondary">Normal</Badge>
      case AnnouncementPriority.HIGH:
        return <Badge variant="warning" className="bg-orange-100 text-orange-800">High</Badge>
      case AnnouncementPriority.URGENT:
        return <Badge variant="destructive">Urgent</Badge>
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!announcement) return <div className="p-6">Announcement not found</div>

  const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date()

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
            <div className="mt-1 flex items-center gap-2">
              {getPriorityBadge(announcement.priority)}
              {announcement.isArchived && <Badge variant="outline">Archived</Badge>}
              {isExpired && <Badge variant="destructive">Expired</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleArchive}
            disabled={toggleArchive.isPending}
          >
            {announcement.isArchived ? (
              <>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Unarchive
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteAnnouncement.isPending}
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
              {new Date(announcement.publishedAt).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="whitespace-pre-wrap text-sm">{announcement.content}</div>

          {announcement.expiresAt && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                <strong>Expires:</strong> {new Date(announcement.expiresAt).toLocaleDateString()}
                {isExpired && ' (Expired)'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
