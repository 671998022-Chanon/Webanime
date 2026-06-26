import type { CreateUserDto, UpdateUserDto, QueryUsersDto } from "../dto";

/**
 * User service — owns user business logic.
 * Methods are stubbed: they define the contract (input/output) but throw
 * until the persistence layer is wired in a future milestone.
 */
export const userService = {
  async create(_dto: CreateUserDto) {
    throw new Error("userService.create — not implemented");
  },

  async findById(_id: string) {
    throw new Error("userService.findById — not implemented");
  },

  async findByEmail(_email: string) {
    throw new Error("userService.findByEmail — not implemented");
  },

  async query(_dto: QueryUsersDto) {
    throw new Error("userService.query — not implemented");
  },

  async update(_id: string, _dto: UpdateUserDto) {
    throw new Error("userService.update — not implemented");
  },

  async delete(_id: string) {
    throw new Error("userService.delete — not implemented");
  },
} as const;
