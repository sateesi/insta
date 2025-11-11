import { Queue } from "bullmq";
import { config } from "../config/env";
import { logger } from "../utils/logger";

export interface ImageJobData {
  postId: string;
  mediaKey: string;
}

const connection = {
  host: config.redis.host,
  port: config.redis.port
};

export const imageQueue = new Queue<ImageJobData>(config.imageQueueName, {
  connection
});

export const enqueueImageJob = async (data: ImageJobData) => {
  await imageQueue.add("process", data, { removeOnComplete: true, removeOnFail: 20 });
  logger.info("Enqueued image processing job", data);
};

