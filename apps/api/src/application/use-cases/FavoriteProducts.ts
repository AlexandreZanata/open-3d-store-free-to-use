import type { IProductFavoriteRepository } from "../../domain/repositories/IProductFavoriteRepository.js";
import type { IProductRepository } from "../../domain/repositories/IProductRepository.js";
import type { IStoreUserFavoriteRepository } from "../../domain/repositories/IStoreUserRepository.js";
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

export type FavoriteOwner =
  | { type: "visitor"; visitorId: string }
  | { type: "user"; userId: string };

export class FavoriteProducts {
  constructor(
    private readonly visitorFavorites: IProductFavoriteRepository,
    private readonly userFavorites: IStoreUserFavoriteRepository,
    private readonly products: IProductRepository,
  ) {}

  async list(owner: FavoriteOwner, locale: SupportedLocale): Promise<FavoriteListResult> {
    const productIds =
      owner.type === "user"
        ? await this.userFavorites.listProductIds(owner.userId)
        : await this.visitorFavorites.listProductIds(owner.visitorId);
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

  async add(owner: FavoriteOwner, productId: string, locale: SupportedLocale): Promise<FavoriteToggleResult> {
    const product = await this.products.findById(productId, locale);
    if (product === null || product.status !== "active") {
      throw new ProductNotFoundError(productId);
    }
    if (owner.type === "user") {
      await this.userFavorites.add(owner.userId, productId);
    } else {
      await this.visitorFavorites.add(owner.visitorId, productId);
    }
    return { productId, favorited: true };
  }

  async remove(owner: FavoriteOwner, productId: string): Promise<FavoriteToggleResult> {
    if (owner.type === "user") {
      await this.userFavorites.remove(owner.userId, productId);
    } else {
      await this.visitorFavorites.remove(owner.visitorId, productId);
    }
    return { productId, favorited: false };
  }
}
