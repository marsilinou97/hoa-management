import { z } from 'zod'
import { router, orgProcedure, adminProcedure, protectedProcedure } from '../trpc'
import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema,
  addMaintenanceUpdateSchema,
  listMaintenanceRequestsSchema,
} from '@/lib/validators/maintenance'
import { MaintenanceStatus } from '@prisma/client'

/**
 * Maintenance router
 * Handles maintenance requests, updates, and status tracking
 */
export const maintenanceRouter = router({
  /**
   * List maintenance requests with optional filters
   */
  list: orgProcedure.input(listMaintenanceRequestsSchema).query(async ({ ctx, input }) => {
    const community = await ctx.prisma.community.findUnique({
      where: { clerkOrgId: ctx.orgId! },
    })

    if (!community) {
      throw new Error('Community not found')
    }

    const where: any = {
      unit: {
        communityId: community.id,
      },
    }

    if (input.unitId) {
      where.unitId = input.unitId
    }

    if (input.status) {
      where.status = input.status
    }

    if (input.urgency) {
      where.urgency = input.urgency
    }

    if (input.category) {
      where.category = input.category
    }

    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: 'insensitive' } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ]
    }

    const requests = await ctx.prisma.maintenanceRequest.findMany({
      where,
      include: {
        unit: {
          select: {
            id: true,
            address: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        updates: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      requests: requests.map((r) => ({
        ...r,
        updateCount: r.updates.length,
      })),
    }
  }),

  /**
   * Get a single maintenance request by ID
   */
  get: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.prisma.maintenanceRequest.findFirst({
        where: {
          id: input.id,
          unit: {
            community: {
              clerkOrgId: ctx.orgId!,
            },
          },
        },
        include: {
          unit: {
            select: {
              id: true,
              address: true,
              ownerName: true,
            },
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          updates: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      if (!request) {
        throw new Error('Maintenance request not found')
      }

      return request
    }),

  /**
   * Get maintenance requests for a specific unit
   */
  getByUnit: orgProcedure
    .input(z.object({ unitId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify unit belongs to this community
      const unit = await ctx.prisma.unit.findFirst({
        where: {
          id: input.unitId,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!unit) {
        throw new Error('Unit not found')
      }

      const requests = await ctx.prisma.maintenanceRequest.findMany({
        where: { unitId: input.unitId },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          updates: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return requests.map((r) => ({
        ...r,
        updateCount: r.updates.length,
      }))
    }),

  /**
   * Create a new maintenance request
   */
  create: protectedProcedure
    .input(createMaintenanceRequestSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify unit belongs to this community
      const unit = await ctx.prisma.unit.findFirst({
        where: {
          id: input.unitId,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!unit) {
        throw new Error('Unit not found')
      }

      // Get user to verify they can create requests for this unit
      const user = await ctx.prisma.user.findFirst({
        where: {
          clerkUserId: ctx.userId!,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Residents can only create requests for their own unit
      const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
      if (!isAdmin && user.unitId !== input.unitId) {
        throw new Error('You can only create requests for your unit')
      }

      const request = await ctx.prisma.maintenanceRequest.create({
        data: {
          unitId: input.unitId,
          title: input.title,
          description: input.description,
          category: input.category,
          urgency: input.urgency,
          location: input.location,
          photos: input.photos || [],
          createdById: user.id,
        },
      })

      // TODO: Send notification to admins via Novu

      return request
    }),

  /**
   * Update a maintenance request
   */
  update: adminProcedure
    .input(updateMaintenanceRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Verify request belongs to this community
      const existing = await ctx.prisma.maintenanceRequest.findFirst({
        where: {
          id,
          unit: {
            community: {
              clerkOrgId: ctx.orgId!,
            },
          },
        },
      })

      if (!existing) {
        throw new Error('Maintenance request not found')
      }

      const request = await ctx.prisma.maintenanceRequest.update({
        where: { id },
        data: {
          ...data,
          // Auto-set completedAt when status changes to COMPLETED
          completedAt:
            data.status === MaintenanceStatus.COMPLETED
              ? new Date()
              : data.status === MaintenanceStatus.SUBMITTED ||
                data.status === MaintenanceStatus.IN_REVIEW ||
                data.status === MaintenanceStatus.IN_PROGRESS
              ? null
              : existing.completedAt,
        },
      })

      // TODO: Send notification to requester via Novu

      return request
    }),

  /**
   * Delete a maintenance request
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify request belongs to this community
      const request = await ctx.prisma.maintenanceRequest.findFirst({
        where: {
          id: input.id,
          unit: {
            community: {
              clerkOrgId: ctx.orgId!,
            },
          },
        },
      })

      if (!request) {
        throw new Error('Maintenance request not found')
      }

      // Delete request (cascade will handle updates)
      await ctx.prisma.maintenanceRequest.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Add an update to a maintenance request
   */
  addUpdate: protectedProcedure
    .input(addMaintenanceUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify request exists and user has access
      const request = await ctx.prisma.maintenanceRequest.findFirst({
        where: {
          id: input.requestId,
          unit: {
            community: {
              clerkOrgId: ctx.orgId!,
            },
          },
        },
        include: {
          unit: true,
        },
      })

      if (!request) {
        throw new Error('Maintenance request not found')
      }

      // Get user to check permissions
      const user = await ctx.prisma.user.findFirst({
        where: {
          clerkUserId: ctx.userId!,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Residents can only update requests on their unit
      const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
      if (!isAdmin && user.unitId !== request.unitId) {
        throw new Error('You can only update requests on your unit')
      }

      // Only admins can create private notes
      if (!input.isPublic && !isAdmin) {
        throw new Error('Only admins can create private notes')
      }

      // Update request with transaction if status is changing
      const update = await ctx.prisma.$transaction(async (tx) => {
        const newUpdate = await tx.maintenanceUpdate.create({
          data: {
            requestId: input.requestId,
            message: input.message,
            isPublic: input.isPublic,
            newStatus: input.newStatus,
            userId: user.id,
          },
        })

        // Update status if provided
        if (input.newStatus) {
          await tx.maintenanceRequest.update({
            where: { id: input.requestId },
            data: { status: input.newStatus },
          })
        } else if (request.status === MaintenanceStatus.SUBMITTED) {
          // Auto-move to IN_REVIEW on first update
          await tx.maintenanceRequest.update({
            where: { id: input.requestId },
            data: { status: MaintenanceStatus.IN_REVIEW },
          })
        }

        return newUpdate
      })

      // TODO: Send notification to relevant parties via Novu

      return update
    }),

  /**
   * Get maintenance statistics
   */
  getStats: orgProcedure.query(async ({ ctx }) => {
    const community = await ctx.prisma.community.findUnique({
      where: { clerkOrgId: ctx.orgId! },
    })

    if (!community) {
      throw new Error('Community not found')
    }

    const [total, submitted, inReview, inProgress, completed, declined] = await Promise.all([
      ctx.prisma.maintenanceRequest.count({
        where: {
          unit: {
            communityId: community.id,
          },
        },
      }),
      ctx.prisma.maintenanceRequest.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: MaintenanceStatus.SUBMITTED,
        },
      }),
      ctx.prisma.maintenanceRequest.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: MaintenanceStatus.IN_REVIEW,
        },
      }),
      ctx.prisma.maintenanceRequest.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: MaintenanceStatus.IN_PROGRESS,
        },
      }),
      ctx.prisma.maintenanceRequest.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: MaintenanceStatus.COMPLETED,
        },
      }),
      ctx.prisma.maintenanceRequest.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: MaintenanceStatus.DECLINED,
        },
      }),
    ])

    return {
      total,
      submitted,
      inReview,
      inProgress,
      completed,
      declined,
      active: submitted + inReview + inProgress,
    }
  }),
})
