import type { AdminUploadKind, AdminUploadResponse } from "@print3d/shared-types";

import { getApiBaseUrl } from "./client";

export async function uploadAdminFile(
  file: File,
  kind: AdminUploadKind,
): Promise<AdminUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const response = await fetch(`${getApiBaseUrl()}/admin/uploads`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const problem = (await response.json()) as { title?: string; detail?: string };
    throw new Error(problem.detail ?? problem.title ?? "Upload failed");
  }

  return (await response.json()) as AdminUploadResponse;
}
