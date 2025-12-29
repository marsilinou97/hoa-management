import { z } from 'zod'
import { AnnouncementPriority } from '@prisma/client'

/**
 * Validation schemas for Announcement operations
 */

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  priority: z.nativeEnum(AnnouncementPriority),
  publishedAt: z.date().optional(), // Defaults to now if not provided
  expiresAt: z.date().optional().nullable(),
})

export const updateAnnouncementSchema = z.object({
  id: z.string().min(1, 'Announcement ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  priority: z.nativeEnum(AnnouncementPriority).optional(),
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional().nullable(),
  isArchived: z.boolean().optional(),
})

export const listAnnouncementsSchema = z.object({
  priority: z.nativeEnum(AnnouncementPriority).optional(),
  search: z.string().optional(),
  includeArchived: z.boolean().default(false),
})

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>
export type ListAnnouncementsInput = z.infer<typeof listAnnouncementsSchema>
