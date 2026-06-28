export type AdminRole = "admin";

export type BilingualTranslations<T> = {
  en: T;
  "pt-BR": T;
};

export type AdminPaginationMeta = {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

export type AdminPaginatedResponse<T> = {
  data: T[];
  pagination: AdminPaginationMeta;
};

export type AdminDataResponse<T> = {
  data: T;
};

/** Server-owned fields — MUST NOT appear in client write payloads. */
export type AdminServerOwnedField =
  | "id"
  | "createdAt"
  | "updatedAt"
  | "passwordHash"
  | "role"
  | "lastLoginAt";
