/** Canonical material codes — mirrored in Postgres `material_type` enum. */
export const MATERIAL_TYPES = [
  "PLA",
  "PETG",
  "PETG_HF",
  "ABS",
  "ASA",
  "TPU",
  "NYLON",
  "RESIN",
] as const;

export type MaterialType = (typeof MATERIAL_TYPES)[number];

export const PAYMENT_METHODS = ["pix", "credit_card", "debit_card", "cash"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
