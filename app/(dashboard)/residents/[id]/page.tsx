'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ResidentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // TODO: Replace with actual tRPC query
  const resident = null
  const isLoading = false

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!resident) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/residents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resident Not Found</h1>
          </div>
        </div>
      </div>
    )
  }

  // Placeholder data
  const residentData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    role: 'RESIDENT',
    avatarUrl: null,
    unit: {
      id: '1',
      address: 'Unit 101',
    },
  }

  const initials = `${residentData.firstName[0]}${residentData.lastName[0]}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/residents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={residentData.avatarUrl || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {residentData.firstName} {residentData.lastName}
            </h1>
            <Badge variant={residentData.role === 'RESIDENT' ? 'secondary' : 'default'}>
              {residentData.role.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href={`mailto:${residentData.email}`} className="text-sm text-primary hover:underline">
                  {residentData.email}
                </a>
              </div>
            </div>
            {residentData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <a href={`tel:${residentData.phone}`} className="text-sm text-primary hover:underline">
                    {residentData.phone}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unit Information */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Information</CardTitle>
          </CardHeader>
          <CardContent>
            {residentData.unit ? (
              <Link href={`/units/${residentData.unit.id}`}>
                <Button variant="outline" className="w-full">
                  {residentData.unit.address}
                </Button>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No unit assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            User can manage their notification preferences in their profile settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
