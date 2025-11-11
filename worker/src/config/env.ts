import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const candidateEnvs = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(__dirname, "../../../.env")
];

for (const envPath of candidateEnvs) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

function ensure(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing env var ${name}`);
  }
  return value;
}

export const workerConfig = {
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379)
  },
  db: {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: ensure(process.env.POSTGRES_USER, "POSTGRES_USER"),
    password: ensure(process.env.POSTGRES_PASSWORD, "POSTGRES_PASSWORD"),
    database: ensure(process.env.POSTGRES_DB, "POSTGRES_DB")
  },
  minio: {
    endpoint: ensure(process.env.MINIO_ENDPOINT, "MINIO_ENDPOINT"),
    region: process.env.MINIO_REGION ?? "us-east-1",
    bucket: process.env.MINIO_BUCKET ?? "media",
    accessKey: ensure(process.env.MINIO_ACCESS_KEY ?? process.env.MINIO_ROOT_USER, "MINIO_ACCESS_KEY"),
    secretKey: ensure(process.env.MINIO_SECRET_KEY ?? process.env.MINIO_ROOT_PASSWORD, "MINIO_SECRET_KEY")
  },
  queueName: process.env.IMAGE_QUEUE_NAME ?? "imageProcessing"
};

