/**
 * Contract: docs/api/admin-contract.md — POST /admin/uploads MIME allowlist
 */
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, afterAll, beforeAll } from "vitest";

import { LocalFileStorage } from "../../../src/infrastructure/storage/LocalFileStorage.js";

describe("LocalFileStorage uploads", () => {
  let tempDir = "";
  let storage: LocalFileStorage;

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "print3d-upload-"));
    storage = new LocalFileStorage(tempDir, "http://localhost:5173/models");
  });

  afterAll(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("saves thumbnail webp under thumbnails/", async () => {
    const result = await storage.saveUpload({
      kind: "thumbnail",
      filename: "poster.webp",
      mimeType: "image/webp",
      data: Buffer.from("RIFF....WEBP"),
    });

    expect(result.url).toMatch(/^\/models\/thumbnails\/.+\.webp$/);
    expect(result.mimeType).toBe("image/webp");
    expect(result.kind).toBe("thumbnail");
  });

  it("converts thumbnail png input to stored webp", async () => {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    const result = await storage.saveUpload({
      kind: "thumbnail",
      filename: "poster.png",
      mimeType: "image/png",
      data: png,
    });

    expect(result.url).toMatch(/^\/models\/thumbnails\/.+\.webp$/);
    expect(result.mimeType).toBe("image/webp");
    expect(result.kind).toBe("thumbnail");
  });

  it("rejects disallowed MIME types", async () => {
    await expect(
      storage.saveUpload({
        kind: "thumbnail",
        filename: "bad.gif",
        mimeType: "image/gif",
        data: Buffer.from("gif"),
      }),
    ).rejects.toThrow(/MIME type not allowed/);
  });

  it("rejects files exceeding kind size limit", async () => {
    const oversized = Buffer.alloc(600 * 1024);
    await expect(
      storage.saveUpload({
        kind: "thumbnail",
        filename: "big.webp",
        mimeType: "image/webp",
        data: oversized,
      }),
    ).rejects.toThrow(/max size/);
  });
});
