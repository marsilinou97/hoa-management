import { z } from 'zod'
import { MaintenanceStatus, Urgency, MaintenanceCategory } from '@prisma/client'

/**
 * Validation schemas for Maintenance Request operations
 * Updated to match actual Prisma schema
 */

export const createMaintenanceRequestSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  category: z.nativeEnum(MaintenanceCategory),
  urgency: z.nativeEnum(Urgency),
  location: z.string().optional(), // Specific location within unit
  photos: z.array(z.string()).optional().default([]), // R2 URLs
})

export const updateMaintenanceRequestSchema = z.object({
  id: z.string().min(1, 'Request ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  category: z.nativeEnum(MaintenanceCategory).optional(),
  urgency: z.nativeEnum(Urgency).optional(),
  status: z.nativeEnum(MaintenanceStatus).optional(),
  location: z.string().optional(),
  adminNotes: z.string().optional(),
})

export const addMaintenanceUpdateSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
  isPublic: z.boolean().default(true), // false = admin-only note
  newStatus: z.nativeEnum(MaintenanceStatus).optional(), // If status was changed
})

export const listMaintenanceRequestsSchema = z.object({
  unitId: z.string().optional(),
  status: z.nativeEnum(MaintenanceStatus).optional(),
  urgency: z.nativeEnum(Urgency).optional(),
  category: z.nativeEnum(MaintenanceCategory).optional(),
  search: z.string().optional(),
})

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>
export type UpdateMaintenanceRequestInput = z.infer<typeof updateMaintenanceRequestSchema>
export type AddMaintenanceUpdateInput = z.infer<typeof addMaintenanceUpdateSchema>
export type ListMaintenanceRequestsInput = z.infer<typeof listMaintenanceRequestsSchema>
