import { z } from 'zod'
import { router, orgProcedure, adminProcedure, protectedProcedure } from '../trpc'
import {
  createViolationSchema,
  updateViolationSchema,
  submitResponseSchema,
  listViolationsSchema,
} from '@/lib/validators/violation'
import { ViolationStatus, LedgerEntryType } from '@prisma/client'

/**
 * Violations router
 * Handles violation tracking, responses, and resolution
 * Updated to match actual Prisma schema
 */
export const violationsRouter = router({
  /**
   * List violations with optional filters
   */
  list: orgProcedure.input(listViolationsSchema).query(async ({ ctx, input }) => {
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

    if (input.type) {
      where.type = input.type
    }

    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: 'insensitive' } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ]
    }

    const violations = await ctx.prisma.violation.findMany({
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
        responses: {
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
      violations: violations.map((v) => ({
        ...v,
        responseCount: v.responses.length,
      })),
    }
  }),

  /**
   * Get a single violation by ID
   */
  get: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const violation = await ctx.prisma.violation.findFirst({
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
          responses: {
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
          ledgerEntries: true,
        },
      })

      if (!violation) {
        throw new Error('Violation not found')
      }

      return violation
    }),

  /**
   * Get violations for a specific unit
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

      const violations = await ctx.prisma.violation.findMany({
        where: { unitId: input.unitId },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          responses: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return violations.map((v) => ({
        ...v,
        responseCount: v.responses.length,
      }))
    }),

  /**
   * Create a new violation
   */
  create: adminProcedure
    .input(createViolationSchema)
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

      // Get user to get database ID
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

      // Create violation and optionally create fine in ledger
      const violation = await ctx.prisma.$transaction(async (tx) => {
        const newViolation = await tx.violation.create({
          data: {
            unitId: input.unitId,
            type: input.type,
            title: input.title,
            description: input.description,
            photos: input.photos || [],
            fineAmount: input.fineAmount,
            dueDate: input.dueDate,
            createdById: user.id,
          },
        })

        // If there's a fine amount, create a ledger entry
        if (input.fineAmount && input.fineAmount > 0) {
          await tx.ledgerEntry.create({
            data: {
              unitId: input.unitId,
              type: LedgerEntryType.VIOLATION_FINE,
              amount: input.fineAmount,
              description: `Violation Fine: ${input.title}`,
              date: new Date(),
              violationId: newViolation.id,
              createdById: user.id,
            },
          })
        }

        return newViolation
      })

      // TODO: Send notification to unit owner/residents via Novu

      return violation
    }),

  /**
   * Update a violation
   */
  update: adminProcedure
    .input(updateViolationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Verify violation belongs to this community
      const existing = await ctx.prisma.violation.findFirst({
        where: {
          id,
          unit: {
            community: {
              clerkOrgId: ctx.orgId!,
            },
          },
        },
        include: {
          ledgerEntries: true,
        },
      })

      if (!existing) {
        throw new Error('Violation not found')
      }

      // Handle fine amount changes
      const violation = await ctx.prisma.$transaction(async (tx) => {
        const updated = await tx.violation.update({
          where: { id },
          data: {
            ...data,
            // Auto-set closedAt when status changes to RESOLVED or CLOSED
            closedAt:
              data.status === ViolationStatus.RESOLVED ||
              data.status === ViolationStatus.CLOSED
                ? data.closedAt ?? new Date()
                : data.closedAt,
          },
        })

        // Handle fine amount updates
        if (data.fineAmount !== undefined) {
          const existingFine = existing.ledgerEntries.find(
            (e) => e.type === LedgerEntryType.VIOLATION_FINE
          )

          if (existingFine) {
            // Update existing ledger entry
            await tx.ledgerEntry.update({
              where: { id: existingFine.id },
              data: {
                amount: data.fineAmount,
              },
            })
          } else if (data.fineAmount > 0) {
            // Create new ledger entry for fine
            await tx.ledgerEntry.create({
              data: {
                unitId: existing.unitId,
                type: LedgerEntryType.VIOLATION_FINE,
                amount: data.fineAmount,
                description: `Violation Fine: ${data.title || existing.title}`,
                date: new Date(),
                violationId: id,
                createdById: existing.createdById,
              },
            })
          }
        }

        return updated
      })

      return violation
    }),

  /**
   * Delete a violation
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify violation belongs to this community
      const violation = await ctx.prisma.violation.findFirst({
        where: {
          id: input.id,
          unit: {
            community: {
              clerkOrgId: ctx.orgId!,
            },
          },
        },
      })

      if (!violation) {
        throw new Error('Violation not found')
      }

      // Delete violation (cascade will handle responses)
      await ctx.prisma.violation.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Submit a response to a violation
   * Available to both admins and residents
   */
  submitResponse: protectedProcedure
    .input(submitResponseSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify violation exists and user has access
      const violation = await ctx.prisma.violation.findFirst({
        where: {
          id: input.violationId,
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

      if (!violation) {
        throw new Error('Violation not found')
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

      // Residents can only respond to violations on their unit
      const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
      if (!isAdmin && user.unitId !== violation.unitId) {
        throw new Error('You can only respond to violations on your unit')
      }

      const response = await ctx.prisma.violationResponse.create({
        data: {
          violationId: input.violationId,
          userId: user.id,
          message: input.message,
          attachments: input.attachments || [],
        },
      })

      // Auto-acknowledge violation on first resident response
      if (!isAdmin && violation.status === ViolationStatus.OPEN) {
        await ctx.prisma.violation.update({
          where: { id: input.violationId },
          data: { status: ViolationStatus.ACKNOWLEDGED },
        })
      }

      // TODO: Send notification to relevant parties via Novu

      return response
    }),

  /**
   * Get violation statistics
   */
  getStats: orgProcedure.query(async ({ ctx }) => {
    const community = await ctx.prisma.community.findUnique({
      where: { clerkOrgId: ctx.orgId! },
    })

    if (!community) {
      throw new Error('Community not found')
    }

    const [total, open, acknowledged, resolved, closed] = await Promise.all([
      ctx.prisma.violation.count({
        where: {
          unit: {
            communityId: community.id,
          },
        },
      }),
      ctx.prisma.violation.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: ViolationStatus.OPEN,
        },
      }),
      ctx.prisma.violation.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: ViolationStatus.ACKNOWLEDGED,
        },
      }),
      ctx.prisma.violation.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: ViolationStatus.RESOLVED,
        },
      }),
      ctx.prisma.violation.count({
        where: {
          unit: {
            communityId: community.id,
          },
          status: ViolationStatus.CLOSED,
        },
      }),
    ])

    return {
      total,
      open,
      acknowledged,
      resolved,
      closed,
      active: open + acknowledged,
    }
  }),
})
