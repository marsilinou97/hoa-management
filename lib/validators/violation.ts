import { z } from 'zod'
import { ViolationStatus, ViolationType } from '@prisma/client'

/**
 * Validation schemas for Violation operations
 * Updated to match actual Prisma schema
 */

export const createViolationSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  type: z.nativeEnum(ViolationType),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  photos: z.array(z.string()).optional().default([]), // R2 URLs
  fineAmount: z.number().nonnegative('Fine amount must be positive or zero').optional(),
  dueDate: z.date().optional(),
})

export const updateViolationSchema = z.object({
  id: z.string().min(1, 'Violation ID is required'),
  type: z.nativeEnum(ViolationType).optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  status: z.nativeEnum(ViolationStatus).optional(),
  fineAmount: z.number().nonnegative('Fine amount must be positive or zero').optional(),
  dueDate: z.date().optional().nullable(),
  closedAt: z.date().optional().nullable(),
})

export const submitResponseSchema = z.object({
  violationId: z.string().min(1, 'Violation ID is required'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
  attachments: z.array(z.string()).optional().default([]), // R2 URLs
})

export const listViolationsSchema = z.object({
  unitId: z.string().optional(),
  status: z.nativeEnum(ViolationStatus).optional(),
  type: z.nativeEnum(ViolationType).optional(),
  search: z.string().optional(),
})

export type CreateViolationInput = z.infer<typeof createViolationSchema>
export type UpdateViolationInput = z.infer<typeof updateViolationSchema>
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>
export type ListViolationsInput = z.infer<typeof listViolationsSchema>
