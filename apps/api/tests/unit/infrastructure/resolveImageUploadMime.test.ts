import { describe, expect, it } from "vitest";

import { resolveImageUploadMime } from "../../../src/infrastructure/storage/resolveImageUploadMime.js";

const pngFixture = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("resolveImageUploadMime", () => {
  it("maps image/jpg alias to image/jpeg", () => {
    expect(resolveImageUploadMime("image/jpg", "photo.jpg", pngFixture)).toBe("image/jpeg");
  });

  it("uses file extension when browser sends application/octet-stream", () => {
    expect(resolveImageUploadMime("application/octet-stream", "photo.png", pngFixture)).toBe(
      "image/png",
    );
  });

  it("sniffs PNG magic bytes when MIME and extension are missing", () => {
    expect(resolveImageUploadMime("application/octet-stream", "upload", pngFixture)).toBe(
      "image/png",
    );
  });

  it("rejects unsupported types", () => {
    expect(() => resolveImageUploadMime("image/gif", "anim.gif", Buffer.from("GIF"))).toThrow(
      /MIME type not allowed/,
    );
  });
});
