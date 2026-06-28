import { describe, expect, it } from "vitest";

import { DomainError } from "../../../src/domain/errors/DomainError.js";
import { Slug } from "../../../src/domain/value-objects/Slug.js";

describe("Slug", () => {
  it("normalizes accents via NFD stripping per domain model", () => {
    const slug = Slug.from("Café au Lait");

    expect(slug.toString()).toBe("cafe-au-lait");
  });

  it("rejects slugs shorter than 2 characters", () => {
    expect(() => Slug.from("a")).toThrow(DomainError);
    expect(() => Slug.from("a")).toThrow("Slug must be at least 2 characters");
  });

  it("hyphenates spaces for catalog slug example", () => {
    const slug = Slug.from("Custom Photo Frame");

    expect(slug.toString()).toBe("custom-photo-frame");
  });
});
