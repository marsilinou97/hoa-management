import { router } from '../trpc'
import { authRouter } from './auth'
import { communityRouter } from './community'
import { unitsRouter } from './units'
import { usersRouter } from './users'
import { invitationsRouter } from './invitations'
import { ledgerRouter } from './ledger'
import { violationsRouter } from './violations'

/**
 * Main tRPC router
 * All feature routers are combined here
 */
export const appRouter = router({
  auth: authRouter,
  community: communityRouter,
  units: unitsRouter,
  users: usersRouter,
  invitations: invitationsRouter,
  ledger: ledgerRouter,
  violations: violationsRouter,
  // Additional routers will be added as we build them:
  // maintenance: maintenanceRouter,
  // announcements: announcementsRouter,
  // documents: documentsRouter,
  // uploads: uploadsRouter,
  // dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
