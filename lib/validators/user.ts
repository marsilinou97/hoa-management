import { z } from 'zod'
import { Role } from '@prisma/client'

/**
 * Validation schemas for User model
 */

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.nativeEnum(Role),
})

export const removeUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type RemoveUserInput = z.infer<typeof removeUserSchema>
