import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Auth router
 * Handles user authentication and profile management
 */
export const authRouter = router({
  /**
   * Get current user information
   */
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: {
        clerkUserId: ctx.userId!,
      },
      include: {
        community: true,
        unit: true,
      },
    })

    if (!user) {
      return null
    }

    return user
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          clerkUserId: ctx.userId!,
        },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
        },
      })

      // Also update Clerk user
      if (input.firstName || input.lastName) {
        const client = await clerkClient()
        await client.users.updateUser(ctx.userId!, {
          firstName: input.firstName,
          lastName: input.lastName,
        })
      }

      return user
    }),

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        emailPayments: z.boolean().optional(),
        emailViolations: z.boolean().optional(),
        emailMaintenance: z.boolean().optional(),
        emailAnnouncements: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          clerkUserId: ctx.userId!,
        },
        data: input,
      })

      return user
    }),
})
