import { router } from '../trpc'
import { authRouter } from './auth'
import { communityRouter } from './community'

/**
 * Main tRPC router
 * All feature routers are combined here
 */
export const appRouter = router({
  auth: authRouter,
  community: communityRouter,
  // Additional routers will be added as we build them:
  // units: unitsRouter,
  // users: usersRouter,
  // ledger: ledgerRouter,
  // violations: violationsRouter,
  // maintenance: maintenanceRouter,
  // announcements: announcementsRouter,
  // documents: documentsRouter,
  // uploads: uploadsRouter,
  // dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
