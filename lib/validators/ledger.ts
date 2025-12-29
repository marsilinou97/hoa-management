import { z } from 'zod'
import { LedgerEntryType, PaymentMethod } from '@prisma/client'

/**
 * Validation schemas for Ledger/Financial operations
 */

export const createLedgerEntrySchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  type: z.nativeEnum(LedgerEntryType),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.date().optional(), // Defaults to now if not provided
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  referenceNumber: z.string().optional(),
  violationId: z.string().optional(),
  notes: z.string().optional(),
})

export const logPaymentSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.date().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

export const createAssessmentSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.date().optional(),
})

export const createAdjustmentSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  amount: z.number(), // Can be positive or negative
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
})

export const bulkAssessmentSchema = z.object({
  unitIds: z.array(z.string()).min(1, 'At least one unit is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.date().optional(),
})

export type CreateLedgerEntryInput = z.infer<typeof createLedgerEntrySchema>
export type LogPaymentInput = z.infer<typeof logPaymentSchema>
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>
export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>
export type BulkAssessmentInput = z.infer<typeof bulkAssessmentSchema>
