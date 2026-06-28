import type { AdminUser } from "../entities/AdminUser.js";

export interface IAdminUserRepository {
  findByEmail(email: string): Promise<AdminUser | null>;
  findById(id: string): Promise<AdminUser | null>;
  updateLastLogin(id: string, at: Date): Promise<void>;
  create(input: {
    email: string;
    passwordHash: string;
  }): Promise<AdminUser>;
}
