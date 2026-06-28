import type { ICacheService } from "../../application/ports/ICacheService.js";
import type { RedisConnection } from "./redis.js";
import {
  categoriesKey,
  productKey,
  productListKey,
  searchKey,
} from "./cacheKeys.js";
import type { ProductFilters } from "../../domain/repositories/IProductRepository.js";

export class CacheService implements ICacheService {
  constructor(private readonly redis: RedisConnection) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for await (const key of this.redis.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100,
    })) {
      await this.redis.del(key);
    }
  }

  async flush(): Promise<void> {
    await this.redis.flushDb();
  }

  static product(slug: string): string {
    return productKey(slug);
  }

  static productList(filters: ProductFilters): string {
    return productListKey(filters);
  }

  static categories(): string {
    return categoriesKey();
  }

  static search(query: string, page: number): string {
    return searchKey(query, page);
  }
}
