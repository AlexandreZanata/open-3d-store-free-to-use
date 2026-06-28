import { describe, expect, it } from "vitest";

import { DomainError } from "../../../src/domain/errors/DomainError.js";
import { assertProductStatusTransition } from "../../../src/domain/services/ProductStatusMachine.js";

describe("ProductStatusMachine", () => {
  it("allows active to out_of_stock", () => {
    expect(() =>
      assertProductStatusTransition("active", "out_of_stock"),
    ).not.toThrow();
  });

  it("rejects discontinued to out_of_stock", () => {
    expect(() =>
      assertProductStatusTransition("discontinued", "out_of_stock"),
    ).toThrow(DomainError);
  });
});
