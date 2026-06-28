import type { DomainEvent } from "../../domain/events/DomainEvent.js";

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
