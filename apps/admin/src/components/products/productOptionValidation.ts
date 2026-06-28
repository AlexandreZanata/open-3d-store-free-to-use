import type { ProductOption } from "@print3d/shared-types";

export function validateProductOptions(options: ProductOption[]): Record<string, string> {
  const errors: Record<string, string> = {};
  options.forEach((option, index) => {
    if (option.name.trim().length === 0) {
      errors[`options.${index}.name`] = "Option name is required";
    }
    if (option.type === "select") {
      const choices = (option.choices ?? []).map((c) => c.trim()).filter(Boolean);
      if (choices.length === 0) {
        errors[`options.${index}.choices`] = "Select options need at least one choice";
      }
    }
  });
  return errors;
}
