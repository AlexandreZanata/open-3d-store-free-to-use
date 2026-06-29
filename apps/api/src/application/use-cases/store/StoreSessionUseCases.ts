import type { StoreCartItem } from "@print3d/shared-types";

import type {
  IStoreSessionRepository,
  IStoreUserRepository,
  IStoreUserStateRepository,
} from "../../../domain/repositories/IStoreUserRepository.js";
import { UnauthorizedError } from "../../errors/ApplicationErrors.js";
import { toStoreUserProfile } from "../../dtos/StoreUserDto.js";

export type RefreshStoreSessionInput = {
  tokenHash: string;
  sessionTtlSeconds: number;
  idleTtlSeconds: number;
};

export class RefreshStoreSession {
  constructor(
    private readonly sessions: IStoreSessionRepository,
    private readonly users: IStoreUserRepository,
    private readonly state: IStoreUserStateRepository,
  ) {}

  async execute(input: RefreshStoreSessionInput): Promise<{
    user: ReturnType<typeof toStoreUserProfile>;
    cart: StoreCartItem[];
  }> {
    const session = await this.sessions.findByTokenHash(input.tokenHash);
    if (session === null) {
      throw new UnauthorizedError();
    }

    const now = Date.now();
    const absoluteMaxMs = session.createdAt.getTime() + input.sessionTtlSeconds * 1000;
    const slidingMs = now + input.idleTtlSeconds * 1000;
    const newExpiresAt = new Date(Math.min(slidingMs, absoluteMaxMs));
    if (newExpiresAt.getTime() <= now) {
      throw new UnauthorizedError();
    }
    if (newExpiresAt.getTime() > session.expiresAt.getTime()) {
      await this.sessions.touch(session.id, newExpiresAt);
    }

    const user = await this.users.findById(session.storeUserId);
    if (user === null || !user.isActive) {
      throw new UnauthorizedError();
    }

    const cart = await this.state.getCart(user.id);
    return { user: toStoreUserProfile(user), cart };
  }
}

export class LogoutStoreUser {
  constructor(private readonly sessions: IStoreSessionRepository) {}

  async execute(tokenHash: string): Promise<void> {
    await this.sessions.deleteByTokenHash(tokenHash);
  }
}

export class UpdateStoreProfile {
  constructor(private readonly users: IStoreUserRepository) {}

  async execute(userId: string, displayName: string) {
    const user = await this.users.updateProfile(userId, displayName);
    return toStoreUserProfile(user);
  }
}

export class SaveStoreCart {
  constructor(private readonly state: IStoreUserStateRepository) {}

  async execute(userId: string, cart: StoreCartItem[]): Promise<StoreCartItem[]> {
    return this.state.saveCart(userId, cart);
  }
}
