import { DomainError } from "../errors/DomainError.js";

export class Price {
  private constructor(private readonly cents: number) {}

  static fromCents(cents: number): Price {
    if (!Number.isInteger(cents)) {
      throw new DomainError("Price must be integer BRL cents");
    }
    if (cents < 0) {
      throw new DomainError("Price cannot be negative");
    }
    return new Price(cents);
  }

  toCents(): number {
    return this.cents;
  }

  toDisplay(): string {
    const reais = Math.floor(this.cents / 100);
    const centavos = this.cents % 100;
    return `R$ ${reais.toLocaleString("pt-BR")},${centavos.toString().padStart(2, "0")}`;
  }

  add(other: Price): Price {
    return Price.fromCents(this.cents + other.toCents());
  }
}
