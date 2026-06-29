import type { CatalogChangedEvent } from "@print3d/shared-types";

import type { ICatalogEventPublisher } from "../../application/ports/ICatalogEventPublisher.js";
import type { RedisConnection } from "../cache/redis.js";
import { CATALOG_EVENT_CHANNEL } from "./catalogEventChannel.js";

export class RedisCatalogEventPublisher implements ICatalogEventPublisher {
  constructor(private readonly redis: RedisConnection) {}

  async publish(event: CatalogChangedEvent): Promise<void> {
    await this.redis.publish(CATALOG_EVENT_CHANNEL, JSON.stringify(event));
  }
}
