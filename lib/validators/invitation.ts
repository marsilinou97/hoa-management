import { z } from 'zod'

/**
 * Validation schemas for Invitation model
 */

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  unitId: z.string().min(1, 'Unit is required'),
})

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
})

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
