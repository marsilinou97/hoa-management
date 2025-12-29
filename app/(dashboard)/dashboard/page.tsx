import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { calculateBalance } from '@/lib/utils/balance'

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
  }

  // Fetch resident's unit and balance (for both admin and resident views)
  let residentBalance = 0
  if (user.unitId) {
    const unit = await prisma.unit.findUnique({
      where: { id: user.unitId },
      include: {
        ledgerEntries: true,
      },
    })
    if (unit) {
      residentBalance = calculateBalance(unit.ledgerEntries)
    }
  }

  if (isAdmin) {
    const [unitsCount, residentsCount, violations, units] = await Promise.all([
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
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.firstName}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Here's what's happening in your community."
            : 'View your account information and community updates.'}
        </p>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Residents
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeResidents}</div>
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
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No recent activity to display.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Coming soon: Quick action buttons for common tasks.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Resident Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Balance</span>
                  <span
                    className={`text-2xl font-bold ${
                      residentBalance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    ${residentBalance.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {residentBalance > 0
                    ? `You have an outstanding balance of $${residentBalance.toFixed(2)}.`
                    : 'Your account is in good standing.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Community Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No announcements at this time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You have no open maintenance requests.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
