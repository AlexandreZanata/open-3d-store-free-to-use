import type { StoreCartItem } from "@print3d/shared-types";

import type { IPasswordHasher } from "../../ports/IPasswordHasher.js";
import type {
  IStoreRegistrationRepository,
  IStoreSessionRepository,
  IStoreUserFavoriteRepository,
  IStoreUserRepository,
  IStoreUserStateRepository,
} from "../../../domain/repositories/IStoreUserRepository.js";
import { InvalidCredentialsError } from "../../errors/ApplicationErrors.js";
import {
  EmailConflictError,
  RegistrationLimitError,
} from "../../errors/StoreAuthErrors.js";
import { mergeStoreCarts, toStoreUserProfile } from "../../dtos/StoreUserDto.js";
import { createSessionToken } from "../../services/sessionToken.js";

export type RegisterStoreUserInput = {
  email: string;
  password: string;
  displayName: string;
  deviceId: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  sessionTtlSeconds: number;
  maxAccountsPerIp: number;
  maxAccountsPerDevice: number;
  visitorId?: string | undefined;
  localCart?: StoreCartItem[] | undefined;
  checkoutNote?: string | null | undefined;
};

export type StoreAuthResult = {
  user: ReturnType<typeof toStoreUserProfile>;
  sessionToken: string;
  cart: StoreCartItem[];
  checkoutNote: string | null;
};

export class RegisterStoreUser {
  constructor(
    private readonly users: IStoreUserRepository,
    private readonly sessions: IStoreSessionRepository,
    private readonly registrations: IStoreRegistrationRepository,
    private readonly state: IStoreUserStateRepository,
    private readonly favorites: IStoreUserFavoriteRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterStoreUserInput): Promise<StoreAuthResult> {
    const [ipCount, deviceCount] = await Promise.all([
      this.registrations.countByIp(input.ipAddress ?? "unknown"),
      this.registrations.countByDevice(input.deviceId),
    ]);
    if (ipCount >= input.maxAccountsPerIp || deviceCount >= input.maxAccountsPerDevice) {
      throw new RegistrationLimitError();
    }

    const existing = await this.users.findByEmail(input.email);
    if (existing !== null) {
      throw new EmailConflictError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.users.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    });

    await this.registrations.recordOrigin(
      user.id,
      input.ipAddress ?? "unknown",
      input.deviceId,
    );

    if (input.visitorId !== undefined) {
      await this.favorites.mergeFromVisitor(user.id, input.visitorId);
    }

    const mergedCart = mergeStoreCarts([], input.localCart ?? []);
    const cart = await this.state.saveCart(user.id, mergedCart);
    const checkoutNote = await this.state.saveCheckoutNote(user.id, input.checkoutNote ?? null);
    const session = await this.createSession(user.id, input);

    return { user: toStoreUserProfile(user), sessionToken: session.raw, cart, checkoutNote };
  }

  private async createSession(
    userId: string,
    input: RegisterStoreUserInput,
  ): Promise<{ raw: string }> {
    const { raw, hash } = createSessionToken();
    await this.sessions.create({
      storeUserId: userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + input.sessionTtlSeconds * 1000),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    return { raw };
  }
}

export type LoginStoreUserInput = {
  email: string;
  password: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  sessionTtlSeconds: number;
  visitorId?: string | undefined;
  localCart?: StoreCartItem[] | undefined;
  checkoutNote?: string | null | undefined;
};

export class LoginStoreUser {
  constructor(
    private readonly users: IStoreUserRepository,
    private readonly sessions: IStoreSessionRepository,
    private readonly state: IStoreUserStateRepository,
    private readonly favorites: IStoreUserFavoriteRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: LoginStoreUserInput): Promise<StoreAuthResult> {
    const user = await this.users.findByEmail(input.email);
    const passwordOk =
      user !== null &&
      user.isActive &&
      (await this.passwordHasher.verify(input.password, user.passwordHash));
    if (!passwordOk) {
      throw new InvalidCredentialsError();
    }

    if (input.visitorId !== undefined) {
      await this.favorites.mergeFromVisitor(user.id, input.visitorId);
    }

    const serverCart = await this.state.getCart(user.id);
    const cart = await this.state.saveCart(
      user.id,
      mergeStoreCarts(serverCart, input.localCart ?? []),
    );
    const checkoutNote =
      input.checkoutNote !== undefined
        ? await this.state.saveCheckoutNote(user.id, input.checkoutNote)
        : await this.state.getCheckoutNote(user.id);

    const { raw, hash } = createSessionToken();
    await this.sessions.create({
      storeUserId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + input.sessionTtlSeconds * 1000),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return { user: toStoreUserProfile(user), sessionToken: raw, cart, checkoutNote };
  }
}
