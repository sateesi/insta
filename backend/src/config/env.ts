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

export interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  redis: {
    host: string;
    port: number;
  };
  minio: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKey: string;
    secretKey: string;
    publicUrl: string;
  };
  imageQueueName: string;
  backendPublicUrl: string;
}

function ensure(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: AppConfig = {
  port: Number(process.env.BACKEND_PORT ?? 4000),
  jwtSecret: ensure(process.env.JWT_SECRET, "JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  refreshSecret: ensure(process.env.REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET"),
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  database: {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: ensure(process.env.POSTGRES_USER, "POSTGRES_USER"),
    password: ensure(process.env.POSTGRES_PASSWORD, "POSTGRES_PASSWORD"),
    name: ensure(process.env.POSTGRES_DB, "POSTGRES_DB")
  },
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379)
  },
  minio: {
    endpoint: ensure(process.env.MINIO_ENDPOINT, "MINIO_ENDPOINT"),
    bucket: process.env.MINIO_BUCKET ?? "media",
    region: process.env.MINIO_REGION ?? "us-east-1",
    accessKey: ensure(process.env.MINIO_ACCESS_KEY ?? process.env.MINIO_ROOT_USER, "MINIO_ACCESS_KEY"),
    secretKey: ensure(process.env.MINIO_SECRET_KEY ?? process.env.MINIO_ROOT_PASSWORD, "MINIO_SECRET_KEY"),
    publicUrl: process.env.MINIO_PUBLIC_URL ?? process.env.MINIO_ENDPOINT ?? "http://localhost:9000"
  },
  imageQueueName: process.env.IMAGE_QUEUE_NAME ?? "imageProcessing",
  backendPublicUrl: process.env.BACKEND_PUBLIC_URL ?? "http://localhost:4000"
};

