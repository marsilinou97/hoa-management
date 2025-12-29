'use client'

import Link from 'next/link'
import { Megaphone, Plus, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/app/_trpc/client'
import { AnnouncementPriority } from '@prisma/client'

export default function AnnouncementsPage() {
  const { data, isLoading } = trpc.announcements.list.useQuery({ includeArchived: false })

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Community updates and information</p>
        </div>
        <Link href="/announcements/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading announcements...</div>
      ) : data?.announcements.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No announcements</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No announcements have been posted yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/announcements/${announcement.id}`}>
                      <h3 className="text-lg font-semibold hover:underline">{announcement.title}</h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      {getPriorityBadge(announcement.priority)}
                      <span className="text-xs text-muted-foreground">
                        Posted by {announcement.createdBy.firstName} {announcement.createdBy.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(announcement.publishedAt).toLocaleDateString()}
                      </span>
                      {announcement.expiresAt && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            Expires {new Date(announcement.expiresAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link href={`/announcements/${announcement.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
