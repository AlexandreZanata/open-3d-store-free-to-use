import type { CatalogChangedEvent } from "@print3d/shared-types";

export interface ICatalogEventPublisher {
  publish(event: CatalogChangedEvent): Promise<void>;
}
