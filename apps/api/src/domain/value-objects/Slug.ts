import { DomainError } from "../errors/DomainError.js";

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;

export class Slug {
  private constructor(private readonly value: string) {}

  static from(raw: string): Slug {
    const normalized = normalizeSlug(raw);
    if (normalized.length < MIN_LENGTH) {
      throw new DomainError(`Slug must be at least ${MIN_LENGTH} characters`);
    }
    if (normalized.length > MAX_LENGTH) {
      throw new DomainError(`Slug must be at most ${MAX_LENGTH} characters`);
    }
    return new Slug(normalized);
  }

  toString(): string {
    return this.value;
  }
}

function normalizeSlug(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}
