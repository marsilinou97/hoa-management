import { z } from 'zod'
import { router, orgProcedure, adminProcedure } from '../trpc'
import {
  createLedgerEntrySchema,
  logPaymentSchema,
  createAssessmentSchema,
  createAdjustmentSchema,
  bulkAssessmentSchema,
} from '@/lib/validators/ledger'
import { calculateBalance, calculateRunningBalance } from '@/lib/utils/balance'
import { LedgerEntryType } from '@prisma/client'

/**
 * Ledger router
 * Handles financial transactions and payment tracking
 */
export const ledgerRouter = router({
  /**
   * Get ledger entries for a specific unit
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

      const entries = await ctx.prisma.ledgerEntry.findMany({
        where: { unitId: input.unitId },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          violation: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      })

      const balance = calculateBalance(entries)
      const entriesWithRunningBalance = calculateRunningBalance(
        [...entries].reverse() // Reverse to calculate from oldest to newest
      ).reverse() // Reverse back to show newest first

      return {
        entries: entriesWithRunningBalance,
        balance,
      }
    }),

  /**
   * Create a ledger entry (generic)
   */
  createEntry: adminProcedure
    .input(createLedgerEntrySchema)
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

      const entry = await ctx.prisma.ledgerEntry.create({
        data: {
          unitId: input.unitId,
          type: input.type,
          amount: input.amount,
          description: input.description,
          date: input.date || new Date(),
          paymentMethod: input.paymentMethod,
          referenceNumber: input.referenceNumber,
          violationId: input.violationId,
          notes: input.notes,
          createdById: ctx.userId!,
        },
      })

      return entry
    }),

  /**
   * Log a payment (simplified interface)
   */
  logPayment: adminProcedure
    .input(logPaymentSchema)
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

      const entry = await ctx.prisma.ledgerEntry.create({
        data: {
          unitId: input.unitId,
          type: LedgerEntryType.PAYMENT,
          amount: input.amount,
          description: `Payment received - ${input.paymentMethod}${
            input.referenceNumber ? ` #${input.referenceNumber}` : ''
          }`,
          date: input.date || new Date(),
          paymentMethod: input.paymentMethod,
          referenceNumber: input.referenceNumber,
          notes: input.notes,
          createdById: ctx.userId!,
        },
      })

      // TODO: Send payment confirmation email via Novu

      return entry
    }),

  /**
   * Create an assessment charge
   */
  createAssessment: adminProcedure
    .input(createAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
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

      const entry = await ctx.prisma.ledgerEntry.create({
        data: {
          unitId: input.unitId,
          type: LedgerEntryType.ASSESSMENT,
          amount: input.amount,
          description: input.description,
          date: input.date || new Date(),
          createdById: ctx.userId!,
        },
      })

      return entry
    }),

  /**
   * Create an adjustment (can be positive or negative)
   */
  createAdjustment: adminProcedure
    .input(createAdjustmentSchema)
    .mutation(async ({ ctx, input }) => {
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

      const entry = await ctx.prisma.ledgerEntry.create({
        data: {
          unitId: input.unitId,
          type: LedgerEntryType.ADJUSTMENT,
          amount: input.amount,
          description: input.description,
          notes: input.notes,
          date: new Date(),
          createdById: ctx.userId!,
        },
      })

      return entry
    }),

  /**
   * Create bulk assessments for multiple units
   */
  bulkAssessment: adminProcedure
    .input(bulkAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      const community = await ctx.prisma.community.findUnique({
        where: { clerkOrgId: ctx.orgId! },
      })

      if (!community) {
        throw new Error('Community not found')
      }

      // Verify all units belong to this community
      const units = await ctx.prisma.unit.findMany({
        where: {
          id: { in: input.unitIds },
          communityId: community.id,
        },
      })

      if (units.length !== input.unitIds.length) {
        throw new Error('Some units not found or do not belong to this community')
      }

      // Create ledger entries for all units
      const entries = await ctx.prisma.$transaction(
        input.unitIds.map((unitId) =>
          ctx.prisma.ledgerEntry.create({
            data: {
              unitId,
              type: LedgerEntryType.ASSESSMENT,
              amount: input.amount,
              description: input.description,
              date: input.date || new Date(),
              createdById: ctx.userId!,
            },
          })
        )
      )

      return { count: entries.length, entries }
    }),

  /**
   * Get outstanding balances across all units
   */
  getOutstandingBalances: orgProcedure.query(async ({ ctx }) => {
    const community = await ctx.prisma.community.findUnique({
      where: { clerkOrgId: ctx.orgId! },
    })

    if (!community) {
      throw new Error('Community not found')
    }

    const units = await ctx.prisma.unit.findMany({
      where: { communityId: community.id },
      include: {
        ledgerEntries: true,
      },
    })

    const balances = units.map((unit) => {
      const balance = calculateBalance(unit.ledgerEntries)
      return {
        unitId: unit.id,
        address: unit.address,
        balance,
        ownerName: unit.ownerName,
      }
    })

    const totalOutstanding = balances.reduce(
      (sum, item) => sum + (item.balance > 0 ? item.balance : 0),
      0
    )

    const unitsWithBalance = balances.filter((b) => b.balance > 0)

    return {
      totalOutstanding,
      unitsWithBalance: unitsWithBalance.length,
      balances: balances.filter((b) => b.balance !== 0), // Only return units with non-zero balance
    }
  }),

  /**
   * Get ledger summary for dashboard
   */
  getSummary: orgProcedure.query(async ({ ctx }) => {
    const community = await ctx.prisma.community.findUnique({
      where: { clerkOrgId: ctx.orgId! },
    })

    if (!community) {
      throw new Error('Community not found')
    }

    const units = await ctx.prisma.unit.findMany({
      where: { communityId: community.id },
      include: {
        ledgerEntries: true,
      },
    })

    let totalOutstanding = 0
    let totalCollected = 0
    let unitsWithBalance = 0

    units.forEach((unit) => {
      const balance = calculateBalance(unit.ledgerEntries)
      if (balance > 0) {
        totalOutstanding += balance
        unitsWithBalance++
      }

      // Calculate total collected (all payments)
      unit.ledgerEntries.forEach((entry) => {
        if (entry.type === LedgerEntryType.PAYMENT) {
          totalCollected += Number(entry.amount)
        }
      })
    })

    return {
      totalOutstanding,
      totalCollected,
      unitsWithBalance,
      totalUnits: units.length,
    }
  }),

  /**
   * Export ledger to CSV
   */
  exportCSV: adminProcedure
    .input(
      z.object({
        unitId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      if (input.startDate || input.endDate) {
        where.date = {}
        if (input.startDate) {
          where.date.gte = input.startDate
        }
        if (input.endDate) {
          where.date.lte = input.endDate
        }
      }

      const entries = await ctx.prisma.ledgerEntry.findMany({
        where,
        include: {
          unit: {
            select: {
              address: true,
            },
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      })

      // Convert to CSV format
      const csvHeaders = [
        'Date',
        'Unit',
        'Type',
        'Description',
        'Charge',
        'Payment',
        'Method',
        'Reference',
        'Created By',
        'Notes',
      ]

      const csvRows = entries.map((entry) => {
        const isCharge = [
          LedgerEntryType.ASSESSMENT,
          LedgerEntryType.LATE_FEE,
          LedgerEntryType.VIOLATION_FINE,
          LedgerEntryType.SPECIAL_ASSESSMENT,
        ].includes(entry.type)

        const isPayment = entry.type === LedgerEntryType.PAYMENT

        return [
          entry.date.toISOString().split('T')[0],
          entry.unit.address,
          entry.type,
          entry.description,
          isCharge ? Number(entry.amount).toFixed(2) : '',
          isPayment ? Number(entry.amount).toFixed(2) : '',
          entry.paymentMethod || '',
          entry.referenceNumber || '',
          `${entry.createdBy.firstName} ${entry.createdBy.lastName}`,
          entry.notes || '',
        ]
      })

      return {
        headers: csvHeaders,
        rows: csvRows,
      }
    }),
})
