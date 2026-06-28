import type {
  AdminProductListItem,
  AdminProductListResponse,
} from "@print3d/shared-types";

import type {
  AdminProductFilters,
  IProductRepository,
  PaginationParams,
} from "../../../domain/repositories/IProductRepository.js";
import { ResourceNotFoundError } from "../../errors/ApplicationErrors.js";
import { toAdminProductDto } from "../../dtos/AdminProductDto.js";

export type ListProductsAdminInput = {
  filters: AdminProductFilters;
  pagination: PaginationParams;
};

export class ListProductsAdmin {
  constructor(private readonly products: IProductRepository) {}

  async execute(
    input: ListProductsAdminInput,
  ): Promise<AdminProductListResponse> {
    const result = await this.products.findManyAdmin(
      input.filters,
      input.pagination,
    );

    return {
      data: result.data.map((item) => toAdminProductDto(item)),
      pagination: result.pagination,
    };
  }
}

export type GetProductAdminInput = {
  productId: string;
};

export class GetProductAdmin {
  constructor(private readonly products: IProductRepository) {}

  async execute(input: GetProductAdminInput): Promise<AdminProductListItem> {
    const product = await this.products.findByIdAdmin(input.productId);
    if (product === null) {
      throw new ResourceNotFoundError("Product", input.productId);
    }
    return toAdminProductDto(product);
  }
}
