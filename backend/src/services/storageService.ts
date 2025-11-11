import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  PutBucketPolicyCommand
} from "@aws-sdk/client-s3";
import { config } from "../config/env";

const s3 = new S3Client({
  region: config.minio.region,
  endpoint: config.minio.endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey
  }
});

export const ensureMediaBucket = async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: config.minio.bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: config.minio.bucket }));
  }

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "AllowPublicRead",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${config.minio.bucket}/*`]
      }
    ]
  };

  try {
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: config.minio.bucket,
        Policy: JSON.stringify(policy)
      })
    );
  } catch (error) {
    console.warn("Failed to apply public bucket policy", error);
  }
};

export const uploadBuffer = async (key: string, buffer: Buffer, contentType: string) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: config.minio.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );
};

export const downloadBuffer = async (key: string): Promise<Buffer> => {
  const result = await s3.send(
    new GetObjectCommand({
      Bucket: config.minio.bucket,
      Key: key
    })
  );

  const body = result.Body;
  if (!body) {
    throw new Error(`Object ${key} has no body`);
  }

  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (typeof body === "string") {
    return Buffer.from(body);
  }

  // Body can be a stream (Node.js Readable)
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    const stream = body as NodeJS.ReadableStream;
    stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
};

export const getPublicUrl = (key: string) => {
  const base = config.minio.publicUrl.replace(/\/$/, "");
  return `${base}/${config.minio.bucket}/${key}`;
};

export const getS3Client = () => s3;

