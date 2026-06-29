export interface IModelProcessingQueue {
  publish(jobId: string): Promise<void>;
}
