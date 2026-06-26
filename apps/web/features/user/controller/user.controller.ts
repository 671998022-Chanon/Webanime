import type { NextRequest } from "next/server";

import { route } from "@/lib/api/route";
import { validate } from "@/lib/api/validate";
import {
  createUserSchema,
  updateUserSchema,
  queryUsersSchema,
} from "../dto";
import { userService } from "../service";

/**
 * User controller — thin HTTP layer that:
 * 1. Validates incoming data via Zod schemas
 * 2. Delegates to the service layer
 * 3. Returns domain-shaped data (envelope applied by `route()` wrapper)
 *
 * No authentication checks here — mounted in a future middleware layer.
 */
export const userController = {
  create: route(async (req: NextRequest) => {
    const body = await req.json();
    const dto = validate(createUserSchema, body);
    return userService.create(dto);
  }),

  findById: route(async (_req: NextRequest, { params }) => {
    const { id } = await params;
    return userService.findById(id);
  }),

  query: route(async (req: NextRequest) => {
    const url = new URL(req.url);
    const dto = validate(queryUsersSchema, {
      search: url.searchParams.get("search") ?? undefined,
      limit: Number(url.searchParams.get("limit")) || undefined,
      offset: Number(url.searchParams.get("offset")) || undefined,
    });
    return userService.query(dto);
  }),

  update: route(async (req: NextRequest, { params }) => {
    const { id } = await params;
    const body = await req.json();
    const dto = validate(updateUserSchema, body);
    return userService.update(id, dto);
  }),

  delete: route(async (_req: NextRequest, { params }) => {
    const { id } = await params;
    await userService.delete(id);
    return { deleted: true };
  }),
} as const;
