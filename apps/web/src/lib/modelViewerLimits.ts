/** Browser-safe cap — docs/features/3d-viewer.md (catalog may store larger files). */
export const MAX_VIEWER_FILE_BYTES = 20 * 1024 * 1024;

/** Rough guard after parse — STL/3MF with huge triangle counts can OOM the tab. */
export const MAX_VIEWER_VERTEX_COUNT = 600_000;

export type ModelLoadBlockReason = "too_large" | "fetch_failed";

export type ModelAssetProbe =
  | { ok: true; contentLength: number | null }
  | { ok: false; reason: ModelLoadBlockReason };

export function isModelFileTooLargeForViewer(bytes: number): boolean {
  return bytes > MAX_VIEWER_FILE_BYTES;
}

export function isGeometryTooHeavyForViewer(vertexCount: number): boolean {
  return vertexCount > MAX_VIEWER_VERTEX_COUNT;
}

export async function probeModelAsset(url: string): Promise<ModelAssetProbe> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) {
      return { ok: false, reason: "fetch_failed" };
    }
    const raw = response.headers.get("content-length");
    if (raw === null) {
      return { ok: true, contentLength: null };
    }
    const contentLength = Number(raw);
    if (!Number.isFinite(contentLength)) {
      return { ok: true, contentLength: null };
    }
    if (isModelFileTooLargeForViewer(contentLength)) {
      return { ok: false, reason: "too_large" };
    }
    return { ok: true, contentLength };
  } catch {
    return { ok: false, reason: "fetch_failed" };
  }
}
