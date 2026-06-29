import amqplib from "amqplib";

import type { IModelProcessingQueue } from "../../application/ports/IModelProcessingQueue.js";

export class RabbitMqModelProcessingPublisher implements IModelProcessingQueue {
  private channel: amqplib.Channel | null = null;

  constructor(
    private readonly url: string,
    private readonly queueName: string,
  ) {}

  async publish(jobId: string): Promise<void> {
    const channel = await this.getChannel();
    channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify({ jobId })), {
      persistent: true,
      contentType: "application/json",
    });
  }

  async close(): Promise<void> {
    await this.channel?.close().catch(() => undefined);
    this.channel = null;
  }

  private async getChannel(): Promise<amqplib.Channel> {
    if (this.channel !== null) {
      return this.channel;
    }
    const connection = await amqplib.connect(this.url);
    const channel = await connection.createChannel();
    await channel.assertQueue(this.queueName, { durable: true });
    this.channel = channel;
    return channel;
  }
}
