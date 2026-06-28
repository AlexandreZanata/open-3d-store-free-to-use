import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ADMIN_UPLOAD_MAX_BYTES,
  ADMIN_UPLOAD_MIME_ALLOWLIST,
  type AdminUploadKind,
  type AdminUploadMimeType,
} from "@print3d/shared-types";
import { uuidv7 } from "uuidv7";

export type SaveUploadInput = {
  kind: AdminUploadKind;
  filename: string;
  mimeType: string;
  data: Buffer;
};

export type SaveUploadResult = {
  url: string;
  mimeType: AdminUploadMimeType;
  sizeBytes: number;
  kind: AdminUploadKind;
};

const KIND_SUBDIR: Record<AdminUploadKind, string> = {
  thumbnail: "thumbnails",
  gallery: "images",
  model: "3d",
};

const EXTENSION_BY_MIME: Record<AdminUploadMimeType, string> = {
  "image/webp": ".webp",
  "model/gltf-binary": ".glb",
  "model/gltf+json": ".gltf",
};

export class LocalFileStorage {
  constructor(
    private readonly basePath: string,
    private readonly baseUrl: string,
    private readonly maxBytes: number = 5 * 1024 * 1024,
  ) {}

  resolveModelUrl(relativePath: string): string {
    return `${this.stripTrailingSlash(this.baseUrl)}/${this.stripLeadingSlash(relativePath)}`;
  }

  resolveFilePath(relativePath: string): string {
    return `${this.stripTrailingSlash(this.basePath)}/${this.stripLeadingSlash(relativePath)}`;
  }

  async saveUpload(input: SaveUploadInput): Promise<SaveUploadResult> {
    this.assertAllowedUpload(input);

    const extension =
      path.extname(input.filename).toLowerCase() ||
      EXTENSION_BY_MIME[input.mimeType as AdminUploadMimeType];
    const storedName = `${uuidv7()}${extension}`;
    const subdir = KIND_SUBDIR[input.kind];
    const relativePath = path.posix.join(subdir, storedName);
    const absolutePath = this.resolveFilePath(relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.data);

    const publicUrl = `/models/${relativePath.replace(/\\/g, "/")}`;
    return {
      url: publicUrl,
      mimeType: input.mimeType as AdminUploadMimeType,
      sizeBytes: input.data.byteLength,
      kind: input.kind,
    };
  }

  async deleteFile(relativeUrlPath: string): Promise<void> {
    const normalized = relativeUrlPath.replace(/^\/models\//, "");
    const absolutePath = this.resolveFilePath(normalized);
    await unlink(absolutePath).catch(() => undefined);
  }

  private assertAllowedUpload(input: SaveUploadInput): void {
    if (!ADMIN_UPLOAD_MIME_ALLOWLIST.includes(input.mimeType as AdminUploadMimeType)) {
      throw new Error(`MIME type not allowed: ${input.mimeType}`);
    }

    const kindLimit = ADMIN_UPLOAD_MAX_BYTES[input.kind];
    if (input.data.byteLength > kindLimit) {
      throw new Error(`Upload exceeds max size for kind ${input.kind}`);
    }
    if (input.data.byteLength > this.maxBytes) {
      throw new Error("Upload exceeds global max size");
    }
  }

  private stripTrailingSlash(value: string): string {
    return value.replace(/\/$/, "");
  }

  private stripLeadingSlash(value: string): string {
    return value.replace(/^\//, "");
  }
}
