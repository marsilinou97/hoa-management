import { z } from 'zod'
import { router, adminProcedure, publicProcedure } from '../trpc'
import { createInvitationSchema, acceptInvitationSchema } from '@/lib/validators/invitation'
import { clerkClient } from '@clerk/nextjs/server'
import { Role } from '@prisma/client'

/**
 * Invitations router
 * Handles resident invitation management
 */
export const invitationsRouter = router({
  /**
   * List all invitations for the community
   */
  list: adminProcedure.query(async ({ ctx }) => {
    const community = await ctx.prisma.community.findUnique({
      where: { clerkOrgId: ctx.orgId! },
    })

    if (!community) {
      throw new Error('Community not found')
    }

    const invitations = await ctx.prisma.invitation.findMany({
      where: {
        communityId: community.id,
        acceptedAt: null, // Only show pending invitations
      },
      include: {
        community: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return invitations
  }),

  /**
   * Create a new invitation
   */
  create: adminProcedure
    .input(createInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const community = await ctx.prisma.community.findUnique({
        where: { clerkOrgId: ctx.orgId! },
      })

      if (!community) {
        throw new Error('Community not found')
      }

      // Check if unit exists
      const unit = await ctx.prisma.unit.findFirst({
        where: {
          id: input.unitId,
          communityId: community.id,
        },
      })

      if (!unit) {
        throw new Error('Unit not found')
      }

      // Check if user is already a member
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
          communityId: community.id,
        },
      })

      if (existingUser) {
        throw new Error('User is already a member of this community')
      }

      // Check if there's already a pending invitation
      const existingInvitation = await ctx.prisma.invitation.findFirst({
        where: {
          email: input.email,
          communityId: community.id,
          acceptedAt: null,
        },
      })

      if (existingInvitation) {
        throw new Error('An invitation has already been sent to this email')
      }

      // Create invitation (expires in 7 days)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const invitation = await ctx.prisma.invitation.create({
        data: {
          email: input.email,
          unitId: input.unitId,
          communityId: community.id,
          expiresAt,
        },
      })

      // TODO: Send invitation email via Novu
      // For now, we'll just return the invitation
      // The frontend can show the invitation link

      return invitation
    }),

  /**
   * Get invitation by token (public - for invitation acceptance page)
   */
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
        include: {
          community: true,
        },
      })

      if (!invitation) {
        return null
      }

      // Check if expired
      if (invitation.expiresAt < new Date()) {
        return { ...invitation, isExpired: true }
      }

      // Check if already accepted
      if (invitation.acceptedAt) {
        return { ...invitation, isAccepted: true }
      }

      return { ...invitation, isExpired: false, isAccepted: false }
    }),

  /**
   * Accept an invitation
   */
  accept: publicProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
        include: {
          community: true,
        },
      })

      if (!invitation) {
        throw new Error('Invitation not found')
      }

      if (invitation.expiresAt < new Date()) {
        throw new Error('This invitation has expired')
      }

      if (invitation.acceptedAt) {
        throw new Error('This invitation has already been accepted')
      }

      if (!ctx.userId) {
        throw new Error('You must be signed in to accept this invitation')
      }

      // Check if user is already a member
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          clerkUserId: ctx.userId,
          communityId: invitation.communityId,
        },
      })

      if (existingUser) {
        throw new Error('You are already a member of this community')
      }

      // Get Clerk user
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(ctx.userId)

      // Add user to Clerk organization
      await client.organizations.createOrganizationMembership({
        organizationId: invitation.community.clerkOrgId,
        userId: ctx.userId,
        role: 'org:member',
      })

      // Create user in database
      const user = await ctx.prisma.user.create({
        data: {
          clerkUserId: ctx.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || invitation.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          role: Role.RESIDENT,
          communityId: invitation.communityId,
          unitId: invitation.unitId,
        },
      })

      // Mark invitation as accepted
      await ctx.prisma.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      })

      return { success: true, user }
    }),

  /**
   * Resend an invitation
   */
  resend: adminProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findFirst({
        where: {
          id: input.invitationId,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!invitation) {
        throw new Error('Invitation not found')
      }

      if (invitation.acceptedAt) {
        throw new Error('This invitation has already been accepted')
      }

      // Extend expiration by 7 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const updated = await ctx.prisma.invitation.update({
        where: { id: input.invitationId },
        data: { expiresAt },
      })

      // TODO: Resend invitation email via Novu

      return updated
    }),

  /**
   * Delete/cancel an invitation
   */
  delete: adminProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findFirst({
        where: {
          id: input.invitationId,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!invitation) {
        throw new Error('Invitation not found')
      }

      await ctx.prisma.invitation.delete({
        where: { id: input.invitationId },
      })

      return { success: true }
    }),
})
