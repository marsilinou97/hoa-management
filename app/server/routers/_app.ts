import { router } from '../trpc'
import { authRouter } from './auth'
import { communityRouter } from './community'
import { unitsRouter } from './units'
import { usersRouter } from './users'
import { invitationsRouter } from './invitations'
import { ledgerRouter } from './ledger'
import { violationsRouter } from './violations'
import { maintenanceRouter } from './maintenance'
import { announcementsRouter } from './announcements'

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
  maintenance: maintenanceRouter,
  announcements: announcementsRouter,
  // Additional routers will be added as we build them:
  // documents: documentsRouter,
  // uploads: uploadsRouter,
  // dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
