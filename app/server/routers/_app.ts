import { router } from '../trpc'

/**
 * Main tRPC router
 * All feature routers will be added here as we build them
 */
export const appRouter = router({
  // Routers will be added here during development
  // auth: authRouter,
  // community: communityRouter,
  // units: unitsRouter,
  // etc.
})

export type AppRouter = typeof appRouter
