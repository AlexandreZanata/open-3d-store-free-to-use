import { createClient } from "redis";

export type RedisConnection = ReturnType<typeof createClient>;

export async function createRedisClient(
  redisUrl: string,
): Promise<RedisConnection> {
  const client = createClient({ url: redisUrl });
  client.on("error", (error: Error) => {
    console.error("Redis client error:", error.message);
  });
  await client.connect();
  return client;
}

export async function disconnectRedis(
  client: RedisConnection,
): Promise<void> {
  if (client.isOpen) {
    await client.quit();
  }
}
