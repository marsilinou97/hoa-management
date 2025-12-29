import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Wrench,
  Plus,
  ArrowRight,
  Pin,
} from 'lucide-react'
import { calculateBalance } from '@/lib/utils/balance'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId, orgId } = await auth()

  if (!userId || !orgId) {
    return null
  }

  const user = await prisma.user.findFirst({
    where: {
      clerkUserId: userId,
      community: {
        clerkOrgId: orgId,
      },
    },
    include: {
      community: true,
    },
  })

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'

  // Fetch stats for admin dashboard
  let stats = {
    totalUnits: 0,
    activeResidents: 0,
    outstandingDues: 0,
    openViolations: 0,
    pendingMaintenance: 0,
  }

  // Fetch resident's unit and balance (for both admin and resident views)
  let residentBalance = 0
  let residentUnit = null
  if (user.unitId) {
    residentUnit = await prisma.unit.findUnique({
      where: { id: user.unitId },
      include: {
        ledgerEntries: true,
      },
    })
    if (residentUnit) {
      residentBalance = calculateBalance(residentUnit.ledgerEntries)
    }
  }

  // Fetch recent announcements
  const recentAnnouncements = await prisma.announcement.findMany({
    where: {
      communityId: user.communityId,
    },
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 5,
  })

  if (isAdmin) {
    const [unitsCount, residentsCount, violations, units, maintenanceRequests] = await Promise.all([
      prisma.unit.count({
        where: { communityId: user.communityId },
      }),
      prisma.user.count({
        where: {
          communityId: user.communityId,
          role: 'RESIDENT',
        },
      }),
      prisma.violation.count({
        where: {
          unit: {
            communityId: user.communityId,
          },
          status: {
            in: ['OPEN', 'ACKNOWLEDGED'],
          },
        },
      }),
      prisma.unit.findMany({
        where: { communityId: user.communityId },
        include: {
          ledgerEntries: true,
        },
      }),
      prisma.maintenanceRequest.count({
        where: {
          unit: {
            communityId: user.communityId,
          },
          status: {
            in: ['SUBMITTED', 'IN_REVIEW', 'IN_PROGRESS'],
          },
        },
      }),
    ])

    // Calculate total outstanding dues across all units
    const totalOutstanding = units.reduce((sum, unit) => {
      const balance = calculateBalance(unit.ledgerEntries)
      return sum + (balance > 0 ? balance : 0)
    }, 0)

    stats = {
      totalUnits: unitsCount,
      activeResidents: residentsCount,
      outstandingDues: totalOutstanding,
      openViolations: violations,
      pendingMaintenance: maintenanceRequests,
    }
  }

  // Fetch recent activity for admin
  const recentViolations = isAdmin
    ? await prisma.violation.findMany({
        where: {
          unit: {
            communityId: user.communityId,
          },
        },
        include: {
          unit: {
            select: {
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      })
    : []

  const recentMaintenanceRequests = isAdmin
    ? await prisma.maintenanceRequest.findMany({
        where: {
          unit: {
            communityId: user.communityId,
          },
        },
        include: {
          unit: {
            select: {
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      })
    : await prisma.maintenanceRequest.findMany({
        where: {
          unitId: user.unitId || '',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      OPEN: { variant: 'destructive', label: 'Open' },
      ACKNOWLEDGED: { variant: 'secondary', label: 'Acknowledged' },
      RESOLVED: { variant: 'default', label: 'Resolved' },
      CLOSED: { variant: 'outline', label: 'Closed' },
      SUBMITTED: { variant: 'secondary', label: 'Submitted' },
      IN_REVIEW: { variant: 'secondary', label: 'In Review' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'outline', label: 'Completed' },
      DECLINED: { variant: 'destructive', label: 'Declined' },
    }
    const config = variants[status] || { variant: 'secondary', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Here's an overview of your community."
              : 'View your account information and community updates.'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href="/announcements/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </Link>
          </div>
        )}
      </div>

      {isAdmin ? (
        <>
          {/* Admin Dashboard */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Units
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUnits}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeResidents} active residents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding Dues
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.outstandingDues.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all units
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Violations
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openViolations}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Maintenance Requests
                </CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingMaintenance}</div>
                <p className="text-xs text-muted-foreground">
                  Pending action
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Violations</CardTitle>
                <CardDescription>
                  Latest violation reports from the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentViolations.length > 0 ? (
                    recentViolations.map((violation) => (
                      <div
                        key={violation.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="space-y-1">
                          <Link
                            href={`/violations/${violation.id}`}
                            className="font-medium hover:underline"
                          >
                            {violation.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {violation.unit.address} • {new Date(violation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(violation.status)}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No violations reported
                    </p>
                  )}
                  {recentViolations.length > 0 && (
                    <Link href="/violations">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Violations
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Maintenance</CardTitle>
                <CardDescription>
                  Latest maintenance requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMaintenanceRequests.length > 0 ? (
                    recentMaintenanceRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col space-y-1 border-b pb-3 last:border-0"
                      >
                        <Link
                          href={`/maintenance/${request.id}`}
                          className="font-medium text-sm hover:underline"
                        >
                          {request.title}
                        </Link>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {request.unit.address}
                          </p>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No maintenance requests
                    </p>
                  )}
                  {recentMaintenanceRequests.length > 0 && (
                    <Link href="/maintenance">
                      <Button variant="outline" size="sm" className="w-full">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community Announcements</CardTitle>
              <CardDescription>
                Recent updates and notices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnnouncements.length > 0 ? (
                  recentAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-start justify-between border-b pb-3 last:border-0"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/announcements/${announcement.id}`}
                            className="font-medium hover:underline"
                          >
                            {announcement.title}
                          </Link>
                          {announcement.isPinned && (
                            <Pin className="h-3 w-3 text-primary" fill="currentColor" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {announcement.createdBy.firstName} {announcement.createdBy.lastName} • {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No announcements yet
                  </p>
                )}
                {recentAnnouncements.length > 0 && (
                  <Link href="/announcements">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Announcements
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Resident Dashboard */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Account Balance</CardTitle>
                <CardDescription>
                  Your current account status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Balance</span>
                    <span
                      className={`text-3xl font-bold ${
                        residentBalance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      ${Math.abs(residentBalance).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {residentBalance > 0
                      ? `You have an outstanding balance of $${residentBalance.toFixed(2)}. `
                      : residentBalance < 0
                      ? `You have a credit of $${Math.abs(residentBalance).toFixed(2)}. `
                      : 'Your account is in good standing. '}
                  </p>
                  <Link href="/dues">
                    <Button variant="outline" size="sm" className="w-full">
                      View Payment History
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>My Unit</CardTitle>
                <CardDescription>
                  Unit information and quick actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {residentUnit && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Address</span>
                        <span className="text-sm">{residentUnit.address}</span>
                      </div>
                      {residentUnit.ownerName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Owner</span>
                          <span className="text-sm">{residentUnit.ownerName}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <Link href="/maintenance/new">
                    <Button variant="outline" size="sm" className="w-full">
                      <Wrench className="mr-2 h-4 w-4" />
                      Submit Maintenance Request
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Maintenance Requests</CardTitle>
              <CardDescription>
                Your recent maintenance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMaintenanceRequests.length > 0 ? (
                  recentMaintenanceRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="space-y-1">
                        <Link
                          href={`/maintenance/${request.id}`}
                          className="font-medium hover:underline"
                        >
                          {request.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    You have no maintenance requests
                  </p>
                )}
                {recentMaintenanceRequests.length > 0 && (
                  <Link href="/maintenance">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Requests
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Announcements</CardTitle>
              <CardDescription>
                Stay updated with community news
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnnouncements.length > 0 ? (
                  recentAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-start justify-between border-b pb-3 last:border-0"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/announcements/${announcement.id}`}
                            className="font-medium hover:underline"
                          >
                            {announcement.title}
                          </Link>
                          {announcement.isPinned && (
                            <Pin className="h-3 w-3 text-primary" fill="currentColor" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No announcements at this time
                  </p>
                )}
                {recentAnnouncements.length > 0 && (
                  <Link href="/announcements">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Announcements
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
