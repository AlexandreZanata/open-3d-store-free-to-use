export const localeQueryProperty = {
  type: "string",
  enum: ["en", "pt-BR"],
  description: "Locale override (default: pt-BR). Also honors Accept-Language header.",
} as const;
