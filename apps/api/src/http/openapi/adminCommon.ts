export const adminTag = ["Admin"] as const;

export const adminObjectSchema = {
  type: "object",
  additionalProperties: true,
} as const;

export const adminUserSchema = {
  type: "object",
  required: ["id", "email", "role", "lastLoginAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["admin"] },
    lastLoginAt: { type: "string", format: "date-time", nullable: true },
  },
} as const;
