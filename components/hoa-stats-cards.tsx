import { TrendingUpIcon, TrendingDownIcon, Building2, Users, DollarSign, AlertTriangle, Wrench } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/balance"

interface HOAStatsCardsProps {
  stats: {
    totalUnits: number
    activeResidents: number
    outstandingDues: number
    openViolations: number
    pendingMaintenance: number
  }
  isAdmin: boolean
}

export function HOAStatsCards({ stats, isAdmin }: HOAStatsCardsProps) {
  if (!isAdmin) {
    // Resident view - show simplified stats
    return (
      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>My Account</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              View Balance
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Check your account status
            </div>
            <div className="text-muted-foreground">
              View payment history and outstanding dues
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Announcements</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              Latest Updates
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Stay informed
            </div>
            <div className="text-muted-foreground">
              Community news and updates
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Admin view - show full stats
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Units</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalUnits}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Building2 className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.activeResidents} active residents
          </div>
          <div className="text-muted-foreground">
            Across all units
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Outstanding Dues</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formatCurrency(stats.outstandingDues)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DollarSign className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Across all units
          </div>
          <div className="text-muted-foreground">
            Total outstanding balance
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Open Violations</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.openViolations}
          </CardTitle>
          <div className="absolute right-4 top-4">
            {stats.openViolations > 0 ? (
              <Badge variant="destructive" className="flex gap-1 rounded-lg text-xs">
                <AlertTriangle className="size-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                None
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.openViolations > 0 ? "Require attention" : "All clear"}
          </div>
          <div className="text-muted-foreground">
            Community compliance
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Maintenance Requests</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.pendingMaintenance}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Wrench className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Pending action
          </div>
          <div className="text-muted-foreground">
            Active requests
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
