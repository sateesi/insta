import { Worker } from "bullmq";
import { workerConfig } from "./config/env";
import { processImageJob } from "./jobs/imageProcessor";

const worker = new Worker(workerConfig.queueName, processImageJob, {
  connection: {
    host: workerConfig.redis.host,
    port: workerConfig.redis.port
  }
});

worker.on("completed", (job) => {
  console.log(`[worker] Job completed`, job.id);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job failed`, job?.id, err);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});

