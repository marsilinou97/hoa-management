import { z } from 'zod'
import { router, orgProcedure, adminProcedure, superAdminProcedure } from '../trpc'
import { updateUserRoleSchema, removeUserSchema } from '@/lib/validators/user'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Users router
 * Handles user/resident management operations
 */
export const usersRouter = router({
  /**
   * List all users in the community
   */
  list: orgProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(['all', 'SUPER_ADMIN', 'ADMIN', 'RESIDENT']).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const community = await ctx.prisma.community.findUnique({
        where: { clerkOrgId: ctx.orgId! },
      })

      if (!community) {
        throw new Error('Community not found')
      }

      const where: any = {
        communityId: community.id,
      }

      // Apply search filter
      if (input?.search) {
        where.OR = [
          { firstName: { contains: input.search, mode: 'insensitive' } },
          { lastName: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      // Apply role filter
      if (input?.role && input.role !== 'all') {
        where.role = input.role
      }

      const users = await ctx.prisma.user.findMany({
        where,
        include: {
          unit: true,
        },
        orderBy: [
          { role: 'asc' },
          { lastName: 'asc' },
        ],
      })

      return users
    }),

  /**
   * Get a single user by ID
   */
  get: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.id,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
        include: {
          unit: true,
          community: true,
        },
      })

      return user
    }),

  /**
   * Update user role (Admin only)
   */
  updateRole: adminProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user belongs to this community
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.userId,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Don't allow changing your own role
      if (user.clerkUserId === ctx.userId) {
        throw new Error('Cannot change your own role')
      }

      const updated = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      })

      // Update Clerk org role
      const client = await clerkClient()
      await client.organizations.updateOrganizationMembership({
        organizationId: ctx.orgId!,
        userId: user.clerkUserId,
        role: input.role === 'SUPER_ADMIN' || input.role === 'ADMIN' ? 'org:admin' : 'org:member',
      })

      return updated
    }),

  /**
   * Remove user from community (Admin only)
   */
  remove: adminProcedure
    .input(removeUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user belongs to this community
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.userId,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Don't allow removing yourself
      if (user.clerkUserId === ctx.userId) {
        throw new Error('Cannot remove yourself')
      }

      // Don't allow removing the super admin
      if (user.role === 'SUPER_ADMIN') {
        throw new Error('Cannot remove the super admin')
      }

      // Remove from database
      await ctx.prisma.user.delete({
        where: { id: input.userId },
      })

      // Remove from Clerk organization
      const client = await clerkClient()
      await client.organizations.deleteOrganizationMembership({
        organizationId: ctx.orgId!,
        userId: user.clerkUserId,
      })

      return { success: true }
    }),
})
