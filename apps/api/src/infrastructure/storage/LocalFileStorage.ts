import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ADMIN_UPLOAD_MAX_BYTES,
  ADMIN_UPLOAD_MIME_ALLOWLIST,
  type AdminUploadKind,
  type AdminUploadMimeType,
} from "@print3d/shared-types";
import { uuidv7 } from "uuidv7";

import {
  isAllowedImageInputMime,
  normalizeImageUpload,
} from "./normalizeImageUpload.js";

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
    const prepared = await this.prepareUpload(input);
    this.assertSizeLimits(prepared);

    const extension = this.resolveStoredExtension(prepared);
    const storedName = `${uuidv7()}${extension}`;
    const subdir = KIND_SUBDIR[prepared.kind];
    const relativePath = path.posix.join(subdir, storedName);
    const absolutePath = this.resolveFilePath(relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, prepared.data);

    const publicUrl = `/models/${relativePath.replace(/\\/g, "/")}`;
    return {
      url: publicUrl,
      mimeType: prepared.mimeType,
      sizeBytes: prepared.data.byteLength,
      kind: prepared.kind,
    };
  }

  private async prepareUpload(input: SaveUploadInput): Promise<{
    kind: AdminUploadKind;
    data: Buffer;
    mimeType: AdminUploadMimeType;
  }> {
    if (input.kind === "thumbnail" || input.kind === "gallery") {
      if (!isAllowedImageInputMime(input.mimeType)) {
        throw new Error(`MIME type not allowed: ${input.mimeType}`);
      }
      const normalized = await normalizeImageUpload(input.data, input.mimeType);
      return {
        kind: input.kind,
        data: normalized.data,
        mimeType: normalized.mimeType,
      };
    }

    if (!ADMIN_UPLOAD_MIME_ALLOWLIST.includes(input.mimeType as AdminUploadMimeType)) {
      throw new Error(`MIME type not allowed: ${input.mimeType}`);
    }

    return {
      kind: input.kind,
      data: input.data,
      mimeType: input.mimeType as AdminUploadMimeType,
    };
  }

  private resolveStoredExtension(prepared: {
    kind: AdminUploadKind;
    mimeType: AdminUploadMimeType;
  }): string {
    if (prepared.kind === "thumbnail" || prepared.kind === "gallery") {
      return ".webp";
    }

    return EXTENSION_BY_MIME[prepared.mimeType];
  }

  private assertSizeLimits(prepared: {
    kind: AdminUploadKind;
    data: Buffer;
  }): void {
    const kindLimit = ADMIN_UPLOAD_MAX_BYTES[prepared.kind];
    if (prepared.data.byteLength > kindLimit) {
      throw new Error(`Upload exceeds max size for kind ${prepared.kind}`);
    }
    if (prepared.data.byteLength > this.maxBytes) {
      throw new Error("Upload exceeds global max size");
    }
  }

  async deleteFile(relativeUrlPath: string): Promise<void> {
    const normalized = relativeUrlPath.replace(/^\/models\//, "");
    const absolutePath = this.resolveFilePath(normalized);
    await unlink(absolutePath).catch(() => undefined);
  }

  private stripTrailingSlash(value: string): string {
    return value.replace(/\/$/, "");
  }

  private stripLeadingSlash(value: string): string {
    return value.replace(/^\//, "");
  }
}
