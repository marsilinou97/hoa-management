"use client"

import { HOASidebar } from "@/components/hoa-sidebar"
import { HOAHeader } from "@/components/hoa-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

interface DashboardClientWrapperProps {
  children: React.ReactNode
  userRole: string
  userName: string
  userEmail: string
  communityName: string
}

// Map paths to page titles
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/units': 'Units',
  '/residents': 'Residents',
  '/violations': 'Violations',
  '/maintenance': 'Maintenance',
  '/announcements': 'Announcements',
  '/dues': 'Financials',
  '/settings': 'Settings',
}

export function DashboardClientWrapper({
  children,
  userRole,
  userName,
  userEmail,
  communityName,
}: DashboardClientWrapperProps) {
  const pathname = usePathname()

  // Get the base path (e.g., /dashboard from /dashboard/123)
  const basePath = '/' + (pathname?.split('/')[1] || 'dashboard')
  const pageTitle = PAGE_TITLES[basePath] || 'Dashboard'

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <HOASidebar
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        communityName={communityName}
      />
      <SidebarInset>
        <HOAHeader title={pageTitle} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
