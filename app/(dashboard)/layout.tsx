import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardClientWrapper } from '@/components/dashboard-client-wrapper'

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

  const userEmail = user.email || `${user.firstName.toLowerCase()}@${user.community.name.toLowerCase().replace(/\s+/g, '')}.com`

  return (
    <DashboardClientWrapper
      userRole={user.role}
      userName={`${user.firstName} ${user.lastName}`}
      userEmail={userEmail}
      communityName={user.community.name}
    >
      {children}
    </DashboardClientWrapper>
  )
}
