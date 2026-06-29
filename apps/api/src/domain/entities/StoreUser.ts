export type StoreUser = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StoreSession = {
  id: string;
  storeUserId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
};

export type CreateStoreSessionInput = {
  storeUserId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};
