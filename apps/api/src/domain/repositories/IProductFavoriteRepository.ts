export interface IProductFavoriteRepository {
  listProductIds(visitorId: string): Promise<string[]>;
  add(visitorId: string, productId: string): Promise<void>;
  remove(visitorId: string, productId: string): Promise<boolean>;
}
