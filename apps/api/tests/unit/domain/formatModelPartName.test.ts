import { describe, expect, it } from "vitest";

import { formatModelPartName } from "../../../src/domain/services/formatModelPartName.js";

describe("formatModelPartName", () => {
  it("replaces opaque upload ids with Part 1", () => {
    expect(formatModelPartName("019f1555-c588-79ad-8204-821b95f06c80")).toBe("Part 1");
  });

  it("keeps human-readable stems", () => {
    expect(formatModelPartName("dragon-body")).toBe("dragon body");
  });
});
