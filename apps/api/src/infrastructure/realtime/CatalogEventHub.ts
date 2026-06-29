import { randomUUID } from "node:crypto";

import type { RedisConnection } from "../cache/redis.js";
import {
  CATALOG_EVENT_CHANNEL,
  CATALOG_SSE_EVENT_NAME,
} from "./catalogEventChannel.js";

const HEARTBEAT_MS = 25_000;

export type CatalogSseConnection = {
  id: string;
  write: (chunk: string) => void;
  close: () => void;
};

export class CatalogEventHub {
  private subscriber: RedisConnection | null = null;
  private readonly connections = new Map<string, CatalogSseConnection>();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly redis: RedisConnection) {}

  async start(): Promise<void> {
    this.subscriber = this.redis.duplicate();
    await this.subscriber.connect();
    await this.subscriber.subscribe(CATALOG_EVENT_CHANNEL, (message) => {
      this.broadcastEvent(message);
    });
    this.heartbeatTimer = setInterval(() => this.broadcastComment("ping"), HEARTBEAT_MS);
  }

  async stop(): Promise<void> {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    for (const connection of this.connections.values()) {
      connection.close();
    }
    this.connections.clear();
    if (this.subscriber?.isOpen) {
      await this.subscriber.quit();
    }
    this.subscriber = null;
  }

  register(connection: CatalogSseConnection): void {
    this.connections.set(connection.id, connection);
  }

  unregister(id: string): void {
    this.connections.delete(id);
  }

  private broadcastEvent(data: string): void {
    this.writeToAll(`event: ${CATALOG_SSE_EVENT_NAME}\ndata: ${data}\n\n`);
  }

  private broadcastComment(comment: string): void {
    this.writeToAll(`: ${comment}\n\n`);
  }

  private writeToAll(frame: string): void {
    for (const connection of [...this.connections.values()]) {
      try {
        connection.write(frame);
      } catch {
        connection.close();
        this.unregister(connection.id);
      }
    }
  }
}

export function createCatalogSseConnection(
  write: (chunk: string) => void,
  close: () => void,
): CatalogSseConnection {
  return { id: randomUUID(), write, close };
}
