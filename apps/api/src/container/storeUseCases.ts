import type { AppConfig } from "../config.js";
import type { IPasswordHasher } from "../application/ports/IPasswordHasher.js";
import { LoginStoreUser, RegisterStoreUser } from "../application/use-cases/store/RegisterStoreUser.js";
import {
  LogoutStoreUser,
  RefreshStoreSession,
  SaveStoreCart,
  UpdateStoreProfile,
} from "../application/use-cases/store/StoreSessionUseCases.js";
import type {
  IStoreRegistrationRepository,
  IStoreSessionRepository,
  IStoreUserFavoriteRepository,
  IStoreUserRepository,
  IStoreUserStateRepository,
} from "../domain/repositories/IStoreUserRepository.js";

export type StoreUseCases = {
  registerStoreUser: RegisterStoreUser;
  loginStoreUser: LoginStoreUser;
  refreshStoreSession: RefreshStoreSession;
  logoutStoreUser: LogoutStoreUser;
  updateStoreProfile: UpdateStoreProfile;
  saveStoreCart: SaveStoreCart;
};

export function createStoreUseCases(deps: {
  config: AppConfig;
  users: IStoreUserRepository;
  sessions: IStoreSessionRepository;
  registrations: IStoreRegistrationRepository;
  state: IStoreUserStateRepository;
  favorites: IStoreUserFavoriteRepository;
  passwordHasher: IPasswordHasher;
}): StoreUseCases {
  return {
    registerStoreUser: new RegisterStoreUser(
      deps.users,
      deps.sessions,
      deps.registrations,
      deps.state,
      deps.favorites,
      deps.passwordHasher,
    ),
    loginStoreUser: new LoginStoreUser(
      deps.users,
      deps.sessions,
      deps.state,
      deps.favorites,
      deps.passwordHasher,
    ),
    refreshStoreSession: new RefreshStoreSession(deps.sessions, deps.users, deps.state),
    logoutStoreUser: new LogoutStoreUser(deps.sessions),
    updateStoreProfile: new UpdateStoreProfile(deps.users),
    saveStoreCart: new SaveStoreCart(deps.state),
  };
}

export const STORE_MAX_ACCOUNTS_PER_IP = 2;
export const STORE_MAX_ACCOUNTS_PER_DEVICE = 2;
