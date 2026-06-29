import type { IProductFavoriteRepository } from "../../domain/repositories/IProductFavoriteRepository.js";
import type { IProductRepository } from "../../domain/repositories/IProductRepository.js";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import { ProductNotFoundError } from "../errors/ApplicationErrors.js";
import {
  toProductListItemDto,
  type ProductListItemDto,
} from "../dtos/ProductResponseDto.js";

export type FavoriteListResult = {
  data: ProductListItemDto[];
  meta: { count: number; productIds: string[] };
};

export type FavoriteToggleResult = {
  productId: string;
  favorited: boolean;
};

export class FavoriteProducts {
  constructor(
    private readonly favorites: IProductFavoriteRepository,
    private readonly products: IProductRepository,
  ) {}

  async list(visitorId: string, locale: SupportedLocale): Promise<FavoriteListResult> {
    const productIds = await this.favorites.listProductIds(visitorId);
    if (productIds.length === 0) {
      return { data: [], meta: { count: 0, productIds: [] } };
    }

    const found = await this.products.findByIds(productIds, locale);
    const byId = new Map(found.map((product) => [product.id, product]));
    const data = productIds
      .map((id) => byId.get(id))
      .filter((product): product is NonNullable<typeof product> => product !== undefined)
      .map((product) => toProductListItemDto(product, locale));

    return { data, meta: { count: data.length, productIds: data.map((item) => item.id) } };
  }

  async add(
    visitorId: string,
    productId: string,
    locale: SupportedLocale,
  ): Promise<FavoriteToggleResult> {
    const product = await this.products.findById(productId, locale);
    if (product === null || product.status !== "active") {
      throw new ProductNotFoundError(productId);
    }
    await this.favorites.add(visitorId, productId);
    return { productId, favorited: true };
  }

  async remove(visitorId: string, productId: string): Promise<FavoriteToggleResult> {
    await this.favorites.remove(visitorId, productId);
    return { productId, favorited: false };
  }
}
