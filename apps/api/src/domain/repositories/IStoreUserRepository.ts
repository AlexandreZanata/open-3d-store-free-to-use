import type { StoreCartItem } from "@print3d/shared-types";

import type { CreateStoreSessionInput, StoreSession, StoreUser } from "../entities/StoreUser.js";

export interface IStoreUserRepository {
  findByEmail(email: string): Promise<StoreUser | null>;
  findById(id: string): Promise<StoreUser | null>;
  create(input: {
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<StoreUser>;
  updateProfile(id: string, displayName: string): Promise<StoreUser>;
}

export interface IStoreSessionRepository {
  create(input: CreateStoreSessionInput): Promise<StoreSession>;
  findByTokenHash(tokenHash: string): Promise<StoreSession | null>;
  touch(id: string, expiresAt: Date): Promise<void>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
}

export interface IStoreRegistrationRepository {
  countByIp(ipAddress: string): Promise<number>;
  countByDevice(deviceId: string): Promise<number>;
  recordOrigin(userId: string, ipAddress: string, deviceId: string): Promise<void>;
}

export interface IStoreUserStateRepository {
  getCart(userId: string): Promise<StoreCartItem[]>;
  saveCart(userId: string, cart: StoreCartItem[]): Promise<StoreCartItem[]>;
}

export interface IStoreUserFavoriteRepository {
  listProductIds(userId: string): Promise<string[]>;
  add(userId: string, productId: string): Promise<void>;
  remove(userId: string, productId: string): Promise<boolean>;
  mergeFromVisitor(userId: string, visitorId: string): Promise<void>;
}
