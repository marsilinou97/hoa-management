import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'
import { Role } from '@prisma/client'

const t = initTRPC.context<Context>().create()

/**
 * Middleware to check if user is authenticated
 */
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.auth.userId,
    },
  })
})

/**
 * Middleware to check if user belongs to an organization (community)
 */
const hasOrganization = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }

  if (!ctx.auth.orgId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No community selected. Please create or join a community.'
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.auth.userId,
      orgId: ctx.auth.orgId,
    },
  })
})

/**
 * Middleware to check if user is an admin (SUPER_ADMIN or ADMIN)
 */
const isAdmin = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId || !ctx.auth.orgId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const user = await ctx.prisma.user.findFirst({
    where: {
      clerkUserId: ctx.auth.userId,
      communityId: ctx.auth.orgId,
    },
    select: { role: true },
  })

  if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.ADMIN)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires admin privileges'
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.auth.userId,
      orgId: ctx.auth.orgId,
      userRole: user.role,
    },
  })
})

/**
 * Middleware to check if user is a super admin
 */
const isSuperAdmin = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId || !ctx.auth.orgId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const user = await ctx.prisma.user.findFirst({
    where: {
      clerkUserId: ctx.auth.userId,
      communityId: ctx.auth.orgId,
    },
    select: { role: true },
  })

  if (!user || user.role !== Role.SUPER_ADMIN) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires super admin privileges'
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.auth.userId,
      orgId: ctx.auth.orgId,
      userRole: user.role,
    },
  })
})

// Export router and procedure helpers
export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
export const orgProcedure = t.procedure.use(hasOrganization)
export const adminProcedure = t.procedure.use(isAdmin)
export const superAdminProcedure = t.procedure.use(isSuperAdmin)
