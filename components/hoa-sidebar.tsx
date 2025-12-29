"use client"

import * as React from "react"
import {
  Building2,
  Users,
  AlertTriangle,
  Wrench,
  Megaphone,
  DollarSign,
  Settings,
  LayoutDashboard,
  Home,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface HOASidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: string
  userName: string
  userEmail: string
  communityName: string
}

export function HOASidebar({ userRole, userName, userEmail, communityName, ...props }: HOASidebarProps) {
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    ...(isAdmin
      ? [
          {
            title: "Units",
            url: "/units",
            icon: Home,
          },
          {
            title: "Residents",
            url: "/residents",
            icon: Users,
          },
          {
            title: "Violations",
            url: "/violations",
            icon: AlertTriangle,
          },
          {
            title: "Maintenance",
            url: "/maintenance",
            icon: Wrench,
          },
          {
            title: "Announcements",
            url: "/announcements",
            icon: Megaphone,
          },
          {
            title: "Financials",
            url: "/dues",
            icon: DollarSign,
          },
        ]
      : [
          {
            title: "My Dues",
            url: "/dues",
            icon: DollarSign,
          },
          {
            title: "Maintenance",
            url: "/maintenance",
            icon: Wrench,
          },
          {
            title: "Announcements",
            url: "/announcements",
            icon: Megaphone,
          },
        ]),
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ]

  const user = {
    name: userName,
    email: userEmail,
    avatar: "", // Can be added later
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <Building2 className="!size-5" />
                <span className="text-base font-semibold">{communityName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
