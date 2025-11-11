import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { workerConfig } from "../config/env";

const s3 = new S3Client({
  region: workerConfig.minio.region,
  endpoint: workerConfig.minio.endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: workerConfig.minio.accessKey,
    secretAccessKey: workerConfig.minio.secretKey
  }
});

export const downloadObject = async (key: string): Promise<Buffer> => {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: workerConfig.minio.bucket,
      Key: key
    })
  );

  const body = response.Body;
  if (!body) {
    throw new Error(`Object ${key} missing body`);
  }

  if (Buffer.isBuffer(body)) {
    return body;
  }

  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    const stream = body as NodeJS.ReadableStream;
    stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

export const uploadObject = async (key: string, buffer: Buffer, contentType: string) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: workerConfig.minio.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );
};

