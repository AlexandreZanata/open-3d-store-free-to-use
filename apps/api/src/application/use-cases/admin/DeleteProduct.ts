import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import {
  ProductHasOrderReferencesError,
  ResourceNotFoundError,
} from "../../errors/ApplicationErrors.js";
import type { AuditLogger } from "../../services/AuditLogger.js";
import type { CatalogCacheInvalidator } from "../../services/CatalogCacheInvalidator.js";

export type DeleteProductInput = {
  adminId: string;
  productId: string;
};

export class DeleteProduct {
  constructor(
    private readonly products: IProductRepository,
    private readonly audit: AuditLogger,
    private readonly cacheInvalidator: CatalogCacheInvalidator,
  ) {}

  async execute(input: DeleteProductInput): Promise<void> {
    const existing = await this.products.findByIdAdmin(input.productId);
    if (existing === null) {
      throw new ResourceNotFoundError("Product", input.productId);
    }

    const orderRefs = await this.products.countOrderReferences(existing.id);
    if (orderRefs > 0) {
      throw new ProductHasOrderReferencesError(existing.id);
    }

    await this.products.delete(existing.id);

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.product.deleted",
      resourceType: "product",
      resourceId: existing.id,
      metadata: {},
    });
    await this.cacheInvalidator.invalidateProduct(existing.slug, "deleted", existing.id);
  }
}
