import { describe, expect, it } from "vitest";

import { IMAGE_UPLOAD_HINT, UPLOAD_ACCEPT_BY_KIND } from "@/lib/uploadAccept";

describe("uploadAccept", () => {
  it("accepts webp jpeg and png in the image file picker", () => {
    expect(UPLOAD_ACCEPT_BY_KIND.thumbnail).toBe("image/webp,image/jpeg,image/png");
    expect(UPLOAD_ACCEPT_BY_KIND.gallery).toBe("image/webp,image/jpeg,image/png");
  });

  it("documents stored-as-webp hint for admins", () => {
    expect(IMAGE_UPLOAD_HINT).toContain("WebP");
    expect(IMAGE_UPLOAD_HINT).toContain("JPEG");
    expect(IMAGE_UPLOAD_HINT).toContain("PNG");
  });
});
