import { z } from 'zod'
import { router, orgProcedure, adminProcedure } from '../trpc'
import { createUnitSchema, updateUnitSchema } from '@/lib/validators/unit'
import { calculateBalance } from '@/lib/utils/balance'

/**
 * Units router
 * Handles unit/property management operations
 */
export const unitsRouter = router({
  /**
   * List all units in the community
   */
  list: orgProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(['all', 'active', 'inactive']).optional(),
        balanceFilter: z.enum(['all', 'paid', 'overdue']).optional(),
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
          { address: { contains: input.search, mode: 'insensitive' } },
          { ownerName: { contains: input.search, mode: 'insensitive' } },
          { tenantName: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      // Apply status filter
      if (input?.status && input.status !== 'all') {
        where.isActive = input.status === 'active'
      }

      const units = await ctx.prisma.unit.findMany({
        where,
        include: {
          residents: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          ledgerEntries: true,
          _count: {
            select: {
              violations: true,
              maintenanceRequests: true,
            },
          },
        },
        orderBy: {
          address: 'asc',
        },
      })

      // Calculate balances and apply balance filter
      const unitsWithBalance = units.map(unit => {
        const balance = calculateBalance(unit.ledgerEntries)
        return { ...unit, balance }
      }).filter(unit => {
        if (!input?.balanceFilter || input.balanceFilter === 'all') return true
        if (input.balanceFilter === 'paid') return unit.balance === 0
        if (input.balanceFilter === 'overdue') return unit.balance > 0
        return true
      })

      return unitsWithBalance
    }),

  /**
   * Get a single unit by ID
   */
  get: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const unit = await ctx.prisma.unit.findFirst({
        where: {
          id: input.id,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
        include: {
          residents: true,
          ledgerEntries: {
            orderBy: {
              date: 'desc',
            },
          },
          violations: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          maintenanceRequests: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      if (!unit) {
        return null
      }

      const balance = calculateBalance(unit.ledgerEntries)

      return { ...unit, balance }
    }),

  /**
   * Create a new unit
   */
  create: adminProcedure
    .input(createUnitSchema)
    .mutation(async ({ ctx, input }) => {
      const community = await ctx.prisma.community.findUnique({
        where: { clerkOrgId: ctx.orgId! },
      })

      if (!community) {
        throw new Error('Community not found')
      }

      const unit = await ctx.prisma.unit.create({
        data: {
          communityId: community.id,
          ...input,
        },
      })

      return unit
    }),

  /**
   * Update a unit
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateUnitSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify unit belongs to this community
      const unit = await ctx.prisma.unit.findFirst({
        where: {
          id: input.id,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!unit) {
        throw new Error('Unit not found')
      }

      const updated = await ctx.prisma.unit.update({
        where: { id: input.id },
        data: input.data,
      })

      return updated
    }),

  /**
   * Delete a unit
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify unit belongs to this community
      const unit = await ctx.prisma.unit.findFirst({
        where: {
          id: input.id,
          community: {
            clerkOrgId: ctx.orgId!,
          },
        },
      })

      if (!unit) {
        throw new Error('Unit not found')
      }

      await ctx.prisma.unit.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Get unit balance
   */
  getBalance: orgProcedure
    .input(z.object({ unitId: z.string() }))
    .query(async ({ ctx, input }) => {
      const entries = await ctx.prisma.ledgerEntry.findMany({
        where: {
          unitId: input.unitId,
          unit: {
            community: {
              clerkOrgId: ctx.orgId!,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      })

      const balance = calculateBalance(entries)

      return { balance, entries }
    }),
})
