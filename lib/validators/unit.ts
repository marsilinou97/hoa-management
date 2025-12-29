import { z } from 'zod'

/**
 * Validation schemas for Unit model
 */

export const createUnitSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  ownerPhone: z.string().optional(),
  tenantName: z.string().optional(),
  tenantEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  tenantPhone: z.string().optional(),
  moveInDate: z.date().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const updateUnitSchema = createUnitSchema.partial()

export type CreateUnitInput = z.infer<typeof createUnitSchema>
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>
