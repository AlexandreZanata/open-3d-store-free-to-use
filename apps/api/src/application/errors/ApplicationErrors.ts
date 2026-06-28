export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}

export class ProductNotFoundError extends ApplicationError {
  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = "ProductNotFoundError";
  }
}

export class ProductNotOrderableError extends ApplicationError {
  constructor(productId: string) {
    super(`Product is not orderable: ${productId}`);
    this.name = "ProductNotOrderableError";
  }
}

export class MissingRequiredOptionError extends ApplicationError {
  constructor(productId: string, optionName: string) {
    super(`Missing required option '${optionName}' for product ${productId}`);
    this.name = "MissingRequiredOptionError";
  }
}
