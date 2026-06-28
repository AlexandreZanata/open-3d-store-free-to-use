import { vi } from "vitest";

import type { AdminUser } from "../../../../src/domain/entities/AdminUser.js";
import type { IAdminSessionRepository } from "../../../../src/domain/repositories/IAdminSessionRepository.js";
import type { IAdminUserRepository } from "../../../../src/domain/repositories/IAdminUserRepository.js";
import type { IAuditLogRepository } from "../../../../src/domain/repositories/IAuditLogRepository.js";
import type { ICategoryRepository } from "../../../../src/domain/repositories/ICategoryRepository.js";
import type { IProductRepository } from "../../../../src/domain/repositories/IProductRepository.js";
import type { IPasswordHasher } from "../../../../src/application/ports/IPasswordHasher.js";
import type { AdminProductListItem } from "@print3d/shared-types";

import { createMockProductRepository } from "../testHelpers.js";

export const sampleAdminUser: AdminUser = {
  id: "01935abc-def0-7890-abcd-ef1234567891",
  email: "admin@example.com",
  passwordHash: "hashed-password",
  role: "admin",
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date("2026-06-28T12:00:00.000Z"),
  updatedAt: new Date("2026-06-28T12:00:00.000Z"),
};

export const sampleAdminProduct: AdminProductListItem = {
  id: "01935abc-def0-7890-abcd-ef1234567890",
  slug: "custom-photo-frame",
  categoryId: "01934abc-def0-7890-abcd-ef1234567890",
  basePrice: 4500,
  material: "PETG",
  printTimeHours: 4,
  weightGrams: 120,
  status: "active",
  options: [],
  modelFileUrl: null,
  thumbnailUrl: "/models/thumbnails/photo-frame.webp",
  imageUrls: ["/models/thumbnails/photo-frame.webp"],
  tags: ["gifts"],
  translations: {
    en: {
      name: "Custom Photo Frame",
      description: "Full description",
      shortDescription: "Photo frame with embossed name",
    },
    "pt-BR": {
      name: "Porta-retrato personalizado",
      description: "Descrição completa",
      shortDescription: "Porta-retrato com nome em relevo",
    },
  },
  createdAt: "2026-06-28T12:00:00.000Z",
  updatedAt: "2026-06-28T12:00:00.000Z",
};

export function createMockPasswordHasher(
  overrides: Partial<IPasswordHasher> = {},
): IPasswordHasher {
  return {
    hash: vi.fn(async (plain) => `hash:${plain}`),
    verify: vi.fn(async (plain, hash) => hash === `hash:${plain}`),
    ...overrides,
  };
}

export function createMockAdminUserRepository(
  overrides: Partial<IAdminUserRepository> = {},
): IAdminUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    updateLastLogin: vi.fn(),
    create: vi.fn(),
    ...overrides,
  };
}

export function createMockAdminSessionRepository(
  overrides: Partial<IAdminSessionRepository> = {},
): IAdminSessionRepository {
  return {
    create: vi.fn(),
    findByTokenHash: vi.fn(),
    delete: vi.fn(),
    deleteExpired: vi.fn(),
    ...overrides,
  };
}

export function createMockAuditLogRepository(
  overrides: Partial<IAuditLogRepository> = {},
): IAuditLogRepository {
  return {
    append: vi.fn(async () => "audit-id"),
    ...overrides,
  };
}

export function createMockCategoryRepository(
  overrides: Partial<ICategoryRepository> = {},
): ICategoryRepository {
  return {
    findAllActive: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    findAllAdmin: vi.fn(),
    findByIdAdmin: vi.fn(),
    existsBySlug: vi.fn(),
    countActiveProducts: vi.fn(),
    ...overrides,
  };
}

export function createMockProductRepositoryAdmin(
  overrides: Partial<IProductRepository> = {},
): IProductRepository {
  return createMockProductRepository(overrides);
}
