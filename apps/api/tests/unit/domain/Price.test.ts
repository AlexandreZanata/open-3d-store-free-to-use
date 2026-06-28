import { describe, expect, it } from "vitest";

import { DomainError } from "../../../src/domain/errors/DomainError.js";
import { Price } from "../../../src/domain/value-objects/Price.js";

describe("Price", () => {
  it("accepts valid integer cents from catalog contract example", () => {
    const price = Price.fromCents(4500);

    expect(price.toCents()).toBe(4500);
    expect(price.toDisplay()).toBe("R$ 45,00");
  });

  it("rejects negative cents", () => {
    expect(() => Price.fromCents(-1)).toThrow(DomainError);
    expect(() => Price.fromCents(-1)).toThrow("Price cannot be negative");
  });

  it("rejects non-integer cents", () => {
    expect(() => Price.fromCents(45.5)).toThrow(DomainError);
    expect(() => Price.fromCents(45.5)).toThrow("Price must be integer BRL cents");
  });

  it("allows zero cents", () => {
    const price = Price.fromCents(0);

    expect(price.toCents()).toBe(0);
    expect(price.toDisplay()).toBe("R$ 0,00");
  });

  it("formats BRL display per domain model and WhatsApp flow example", () => {
    const price = Price.fromCents(9000);

    expect(price.toDisplay()).toBe("R$ 90,00");
  });

  it("adds two prices in cents without float drift", () => {
    const unit = Price.fromCents(4500);
    const total = unit.add(unit);

    expect(total.toCents()).toBe(9000);
    expect(total.toDisplay()).toBe("R$ 90,00");
  });
});
