import type {
  AdminSession,
  CreateAdminSessionInput,
} from "../entities/AdminUser.js";

export interface IAdminSessionRepository {
  create(input: CreateAdminSessionInput): Promise<AdminSession>;
  findByTokenHash(tokenHash: string): Promise<AdminSession | null>;
  touch(id: string, expiresAt: Date): Promise<void>;
  delete(id: string): Promise<void>;
  deleteExpired(before: Date): Promise<number>;
}
