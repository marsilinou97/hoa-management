import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, orgId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // If user doesn't have an organization, redirect to onboarding
  if (!orgId) {
    redirect('/onboarding')
  }

  // Get user data from database
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

  // If user not in database, they need to complete setup
  if (!user) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userRole={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          communityName={user.community.name}
          userName={`${user.firstName} ${user.lastName}`}
        />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
