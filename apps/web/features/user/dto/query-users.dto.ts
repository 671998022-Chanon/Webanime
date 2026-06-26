import { z } from "zod";

/**
 * DTO for querying / listing users with pagination and optional filters.
 */
export const queryUsersSchema = z.object({
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type QueryUsersDto = z.infer<typeof queryUsersSchema>;
