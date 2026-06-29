import type { AdminUploadKind, AdminUploadResponse } from "@print3d/shared-types";

import { ApiError, getApiBaseUrl } from "./client";

export async function uploadAdminFile(
  file: File,
  kind: AdminUploadKind,
): Promise<AdminUploadResponse> {
  const formData = new FormData();
  formData.append("kind", kind);
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/admin/uploads`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    let detail = "Upload failed";
    try {
      const problem = (await response.json()) as { title?: string; detail?: string };
      detail = problem.detail ?? problem.title ?? detail;
    } catch {
      detail = response.statusText || detail;
    }
    throw new ApiError(response.status, {
      type: "https://yourdomain.com/errors/upload-failed",
      title: "Upload failed",
      status: response.status,
      detail,
    });
  }

  return (await response.json()) as AdminUploadResponse;
}
