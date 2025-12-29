'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  Wrench,
  Megaphone,
  FileText,
  UserCircle,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

interface SidebarProps {
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'RESIDENT'
}

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/units', label: 'Units', icon: Building2 },
  { href: '/residents', label: 'Residents', icon: Users },
  { href: '/dues', label: 'Payments & Dues', icon: DollarSign },
  { href: '/violations', label: 'Violations', icon: AlertTriangle },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/documents', label: 'Documents', icon: FileText },
]

const residentNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account', label: 'My Account', icon: DollarSign },
  { href: '/violations', label: 'My Violations', icon: AlertTriangle },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/directory', label: 'Directory', icon: Users },
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
  const navItems = isAdmin ? adminNavItems : residentNavItems

  const NavContent = () => (
    <>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">HOA Hub</h2>
          </Link>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive && 'bg-secondary font-medium'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <Separator />

      <div className="py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === '/profile' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname?.startsWith('/settings') ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background transition-transform duration-300 md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full overflow-y-auto border-r pt-16">
          <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden h-full w-64 flex-col border-r bg-background md:flex">
        <NavContent />
      </div>
    </>
  )
}
