import { z } from "zod";

/**
 * DTO for updating an existing user.
 * All fields optional — only provided fields are applied.
 */
export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  avatarUrl: z.string().url().optional(),
  username: z.string().min(3).max(32).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
