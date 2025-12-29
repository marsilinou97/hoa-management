import { z } from 'zod'
import { router, protectedProcedure, orgProcedure, superAdminProcedure } from '../trpc'
import { clerkClient } from '@clerk/nextjs/server'
import { AssessmentFrequency, Role } from '@prisma/client'

const createCommunitySchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  assessmentAmount: z.number().positive().optional(),
  assessmentFrequency: z.nativeEnum(AssessmentFrequency).optional(),
  assessmentDueDay: z.number().min(1).max(28).optional(),
  gracePeriodDays: z.number().min(0).optional(),
  lateFeeAmount: z.number().min(0).optional(),
})

const updateCommunitySchema = createCommunitySchema.partial()

/**
 * Community router
 * Handles community/HOA management operations
 */
export const communityRouter = router({
  /**
   * Create a new community
   * Creates both Clerk org and database record
   */
  create: protectedProcedure
    .input(createCommunitySchema)
    .mutation(async ({ ctx, input }) => {
      const client = await clerkClient()
      const user = await client.users.getUser(ctx.userId!)

      // Create Clerk organization
      const org = await client.organizations.createOrganization({
        name: input.name,
        createdBy: ctx.userId!,
      })

      // Create community in database
      const community = await ctx.prisma.community.create({
        data: {
          clerkOrgId: org.id,
          name: input.name,
          address: input.address,
          city: input.city,
          state: input.state,
          zip: input.zip,
          assessmentAmount: input.assessmentAmount,
          assessmentFrequency: input.assessmentFrequency || AssessmentFrequency.MONTHLY,
          assessmentDueDay: input.assessmentDueDay || 1,
          gracePeriodDays: input.gracePeriodDays || 15,
          lateFeeAmount: input.lateFeeAmount,
        },
      })

      // Create user record in database as SUPER_ADMIN
      await ctx.prisma.user.create({
        data: {
          clerkUserId: ctx.userId!,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatarUrl: user.imageUrl,
          role: Role.SUPER_ADMIN,
          communityId: community.id,
        },
      })

      return community
    }),

  /**
   * Get current community information
   */
  get: orgProcedure.query(async ({ ctx }) => {
    const community = await ctx.prisma.community.findUnique({
      where: {
        clerkOrgId: ctx.orgId!,
      },
    })

    return community
  }),

  /**
   * Update community information
   * Requires super admin role
   */
  update: superAdminProcedure
    .input(updateCommunitySchema)
    .mutation(async ({ ctx, input }) => {
      const community = await ctx.prisma.community.update({
        where: {
          clerkOrgId: ctx.orgId!,
        },
        data: input,
      })

      // Also update Clerk org name if provided
      if (input.name) {
        const client = await clerkClient()
        await client.organizations.updateOrganization(ctx.orgId!, {
          name: input.name,
        })
      }

      return community
    }),

  /**
   * Get community settings (assessment configuration)
   */
  getSettings: orgProcedure.query(async ({ ctx }) => {
    const community = await ctx.prisma.community.findUnique({
      where: {
        clerkOrgId: ctx.orgId!,
      },
      select: {
        id: true,
        name: true,
        assessmentAmount: true,
        assessmentFrequency: true,
        assessmentDueDay: true,
        gracePeriodDays: true,
        lateFeeAmount: true,
      },
    })

    return community
  }),

  /**
   * Update assessment settings
   * Requires super admin role
   */
  updateSettings: superAdminProcedure
    .input(
      z.object({
        assessmentAmount: z.number().positive().optional(),
        assessmentFrequency: z.nativeEnum(AssessmentFrequency).optional(),
        assessmentDueDay: z.number().min(1).max(28).optional(),
        gracePeriodDays: z.number().min(0).optional(),
        lateFeeAmount: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const community = await ctx.prisma.community.update({
        where: {
          clerkOrgId: ctx.orgId!,
        },
        data: input,
      })

      return community
    }),
})
