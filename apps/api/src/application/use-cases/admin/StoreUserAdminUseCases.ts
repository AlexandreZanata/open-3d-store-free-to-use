import type {
  AdminStoreUserDetail,
  AdminStoreUserListResponse,
  UpdateStoreUserAdminPayload,
} from "@print3d/shared-types";

import type {
  IStoreSessionRepository,
  IStoreUserRepository,
  StoreUserAdminFilters,
} from "../../../domain/repositories/IStoreUserRepository.js";
import type { PaginationParams } from "../../../domain/repositories/IProductRepository.js";
import { ResourceNotFoundError } from "../../errors/ApplicationErrors.js";
import {
  toAdminStoreUserDetailDto,
  toAdminStoreUserListDto,
} from "../../dtos/StoreUserAdminDto.js";

export type ListStoreUsersAdminInput = {
  filters: StoreUserAdminFilters;
  pagination: PaginationParams;
};

export class ListStoreUsersAdmin {
  constructor(private readonly users: IStoreUserRepository) {}

  async execute(input: ListStoreUsersAdminInput): Promise<AdminStoreUserListResponse> {
    const result = await this.users.findManyAdmin(input.filters, input.pagination);
    return {
      data: result.data.map((row) => toAdminStoreUserListDto(row)),
      pagination: result.pagination,
    };
  }
}

export type GetStoreUserAdminInput = {
  userId: string;
};

export class GetStoreUserAdmin {
  constructor(private readonly users: IStoreUserRepository) {}

  async execute(input: GetStoreUserAdminInput): Promise<AdminStoreUserDetail> {
    const row = await this.users.findAdminDetail(input.userId);
    if (row === null) {
      throw new ResourceNotFoundError("Store user", input.userId);
    }
    return toAdminStoreUserDetailDto(row);
  }
}

export type UpdateStoreUserAdminInput = {
  userId: string;
  payload: UpdateStoreUserAdminPayload;
};

export class UpdateStoreUserAdmin {
  constructor(
    private readonly users: IStoreUserRepository,
    private readonly sessions: IStoreSessionRepository,
  ) {}

  async execute(input: UpdateStoreUserAdminInput): Promise<AdminStoreUserDetail> {
    const existing = await this.users.findById(input.userId);
    if (existing === null) {
      throw new ResourceNotFoundError("Store user", input.userId);
    }

    if (existing.isActive !== input.payload.isActive) {
      await this.users.setActive(input.userId, input.payload.isActive);
      if (!input.payload.isActive) {
        await this.sessions.deleteAllForUser(input.userId);
      }
    }

    const row = await this.users.findAdminDetail(input.userId);
    if (row === null) {
      throw new ResourceNotFoundError("Store user", input.userId);
    }
    return toAdminStoreUserDetailDto(row);
  }
}
