import { z } from 'zod'
import { router, orgProcedure, adminProcedure } from '../trpc'
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  listAnnouncementsSchema,
} from '@/lib/validators/announcement'

/**
 * Announcements router
 * Handles community-wide announcements and communications
 */
export const announcementsRouter = router({
  /**
   * List announcements with optional filters
   */
  list: orgProcedure.input(listAnnouncementsSchema).query(async ({ ctx, input }) => {
    const community = await ctx.prisma.community.findUnique({
      where: { clerkOrgId: ctx.orgId! },
    })

    if (!community) {
      throw new Error('Community not found')
    }

    const where: any = {
      communityId: community.id,
    }

    if (input.pinnedOnly) {
      where.isPinned = true
    }

    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: 'insensitive' } },
        { content: { contains: input.search, mode: 'insensitive' } },
      ]
    }

    const announcements = await ctx.prisma.announcement.findMany({
      where,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return {
      announcements,
    }
  }),

  /**
   * Get a single announcement by ID
   */
  get: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const announcement = await ctx.prisma.announcement.findFirst({
        where: {
          id: input.id,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      if (!announcement) {
        throw new Error('Announcement not found')
      }

      return announcement
    }),

  /**
   * Create a new announcement
   */
  create: adminProcedure
    .input(createAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      const community = await ctx.prisma.community.findUnique({
        where: { clerkOrgId: ctx.orgId! },
      })

      if (!community) {
        throw new Error('Community not found')
      }

      // Get user to get database ID
      const user = await ctx.prisma.user.findFirst({
        where: {
          clerkUserId: ctx.userId!,
          communityId: community.id,
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      const announcement = await ctx.prisma.announcement.create({
        data: {
          communityId: community.id,
          title: input.title,
          content: input.content,
          isPinned: input.isPinned,
          createdById: user.id,
        },
      })

      // TODO: Send notification to all residents via Novu

      return announcement
    }),

  /**
   * Update an announcement
   */
  update: adminProcedure
    .input(updateAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Verify announcement belongs to this community
      const existing = await ctx.prisma.announcement.findFirst({
        where: {
          id,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!existing) {
        throw new Error('Announcement not found')
      }

      const announcement = await ctx.prisma.announcement.update({
        where: { id },
        data,
      })

      return announcement
    }),

  /**
   * Delete an announcement
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify announcement belongs to this community
      const announcement = await ctx.prisma.announcement.findFirst({
        where: {
          id: input.id,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!announcement) {
        throw new Error('Announcement not found')
      }

      await ctx.prisma.announcement.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Pin/unpin an announcement
   */
  togglePin: adminProcedure
    .input(z.object({ id: z.string(), isPinned: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify announcement belongs to this community
      const announcement = await ctx.prisma.announcement.findFirst({
        where: {
          id: input.id,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!announcement) {
        throw new Error('Announcement not found')
      }

      const updated = await ctx.prisma.announcement.update({
        where: { id: input.id },
        data: { isPinned: input.isPinned },
      })

      return updated
    }),

  /**
   * Get recent announcements for dashboard
   */
  getRecent: orgProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const community = await ctx.prisma.community.findUnique({
        where: { clerkOrgId: ctx.orgId! },
      })

      if (!community) {
        throw new Error('Community not found')
      }

      const announcements = await ctx.prisma.announcement.findMany({
        where: {
          communityId: community.id,
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        take: input.limit,
      })

      return announcements
    }),
})
