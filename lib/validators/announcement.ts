import { z } from 'zod'

/**
 * Validation schemas for Announcement operations
 * Updated to match actual Prisma schema (no priority, dates, or archive - only isPinned)
 */

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  isPinned: z.boolean().default(false),
})

export const updateAnnouncementSchema = z.object({
  id: z.string().min(1, 'Announcement ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  isPinned: z.boolean().optional(),
})

export const listAnnouncementsSchema = z.object({
  search: z.string().optional(),
  pinnedOnly: z.boolean().default(false),
})

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>
export type ListAnnouncementsInput = z.infer<typeof listAnnouncementsSchema>
