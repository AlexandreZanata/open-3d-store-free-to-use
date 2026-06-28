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

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export class AdminNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(`Admin user not found: ${id}`);
    this.name = "AdminNotFoundError";
  }
}

export class ResourceNotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = "ResourceNotFoundError";
  }
}

export class SlugConflictError extends ApplicationError {
  constructor(slug: string) {
    super(`Slug already exists: ${slug}`);
    this.name = "SlugConflictError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ProductHasOrderReferencesError extends ApplicationError {
  constructor(productId: string) {
    super(
      `Product ${productId} has order captures; set status to discontinued instead`,
    );
    this.name = "ProductHasOrderReferencesError";
  }
}

export class CategoryHasActiveProductsError extends ApplicationError {
  constructor(categoryId: string) {
    super(`Category ${categoryId} has active products`);
    this.name = "CategoryHasActiveProductsError";
  }
}
