import type { CategoryResponse, SupportedLocale } from "@print3d/shared-types";

import { apiFetch } from "./client";

export async function fetchCategories(locale?: SupportedLocale): Promise<CategoryResponse[]> {
  const response = await apiFetch<{ data: CategoryResponse[] }>("/categories", { locale });
  return response.data;
}
