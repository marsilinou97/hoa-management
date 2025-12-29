import { z } from 'zod'
import { ViolationSeverity, ViolationStatus } from '@prisma/client'

/**
 * Validation schemas for Violation operations
 */

export const createViolationSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  severity: z.nativeEnum(ViolationSeverity),
  fineAmount: z.number().nonnegative('Fine amount must be positive or zero').optional(),
  reportedAt: z.date().optional(), // Defaults to now if not provided
})

export const updateViolationSchema = z.object({
  id: z.string().min(1, 'Violation ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  severity: z.nativeEnum(ViolationSeverity).optional(),
  status: z.nativeEnum(ViolationStatus).optional(),
  fineAmount: z.number().nonnegative('Fine amount must be positive or zero').optional(),
  resolvedAt: z.date().optional().nullable(),
})

export const submitResponseSchema = z.object({
  violationId: z.string().min(1, 'Violation ID is required'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
  isInternal: z.boolean().default(false), // Internal notes only visible to admins
})

export const listViolationsSchema = z.object({
  unitId: z.string().optional(),
  status: z.nativeEnum(ViolationStatus).optional(),
  severity: z.nativeEnum(ViolationSeverity).optional(),
  search: z.string().optional(),
})

export type CreateViolationInput = z.infer<typeof createViolationSchema>
export type UpdateViolationInput = z.infer<typeof updateViolationSchema>
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>
export type ListViolationsInput = z.infer<typeof listViolationsSchema>
