import { z } from "zod";

/**
 * DTO for creating a new user.
 * Validation rules are enforced via Zod; the service layer receives the typed output.
 */
export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  displayName: z.string().min(1).max(64).optional(),
  avatarUrl: z.string().url().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
