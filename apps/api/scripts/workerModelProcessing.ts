import amqplib from "amqplib";

import { ProcessModelUpload } from "../src/application/use-cases/admin/ProcessModelUpload.js";
import { loadConfig } from "../src/config.js";
import { createDb } from "../src/infrastructure/db/client.js";
import { DrizzleModelProcessingJobRepository } from "../src/infrastructure/repositories/DrizzleModelProcessingJobRepository.js";
import { DrizzleShopSettingsRepository } from "../src/infrastructure/repositories/DrizzleShopSettingsRepository.js";

async function main(): Promise<void> {
  const config = loadConfig();
  if (!config.RABBITMQ_URL) {
    throw new Error("RABBITMQ_URL is required for the model processing worker");
  }

  const { db, pool } = createDb(config.DATABASE_URL);
  const jobs = new DrizzleModelProcessingJobRepository(db);
  const shopSettings = new DrizzleShopSettingsRepository(db);
  const processor = new ProcessModelUpload(jobs, shopSettings);

  const connection = await amqplib.connect(config.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(config.MODEL_PROCESSING_QUEUE, { durable: true });
  await channel.prefetch(1);

  console.log(`Model processing worker listening on ${config.MODEL_PROCESSING_QUEUE}`);

  await channel.consume(config.MODEL_PROCESSING_QUEUE, (message) => {
    if (message === null) {
      return;
    }

    void (async () => {
      try {
        const payload = JSON.parse(message.content.toString("utf8")) as { jobId?: string };
        if (!payload.jobId) {
          channel.nack(message, false, false);
          return;
        }
        await processor.execute({ jobId: payload.jobId });
        channel.ack(message);
      } catch (error) {
        console.error("Model processing worker failed:", error);
        channel.nack(message, false, true);
      }
    })();
  });

  const shutdown = async () => {
    await channel.close();
    await connection.close();
    await pool.end();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
