import type { ProcessModelUpload } from "../../application/use-cases/admin/ProcessModelUpload.js";
import type { IModelProcessingQueue } from "../../application/ports/IModelProcessingQueue.js";
import { BestEffortModelProcessingPublisher } from "./BestEffortModelProcessingPublisher.js";
import { InlineModelProcessingPublisher } from "./InlineModelProcessingPublisher.js";
import { RabbitMqModelProcessingPublisher } from "./RabbitMqModelProcessingPublisher.js";

export function createModelProcessingQueue(
  rabbitmqUrl: string | undefined,
  queueName: string,
  processor: ProcessModelUpload,
): IModelProcessingQueue {
  const inline = new InlineModelProcessingPublisher(processor);
  if (!rabbitmqUrl) {
    return inline;
  }
  return new BestEffortModelProcessingPublisher(
    new RabbitMqModelProcessingPublisher(rabbitmqUrl, queueName),
    inline,
  );
}
