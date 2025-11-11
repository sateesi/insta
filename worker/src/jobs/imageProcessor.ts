import sharp from "sharp";
import { Job } from "bullmq";
import { downloadObject, uploadObject } from "../services/storage";
import { WorkerDataSource } from "../config/data-source";
import { Post } from "../entities/Post";

export interface ImageJobData {
  postId: string;
  mediaKey: string;
}

export const processImageJob = async (job: Job<ImageJobData>) => {
  const { mediaKey, postId } = job.data;
  const buffer = await downloadObject(mediaKey);

  const thumbnailKey = `thumbnails/${postId}-thumb.jpg`;
  const mediumKey = `medium/${postId}-medium.jpg`;

  const [thumbnail, medium] = await Promise.all([
    sharp(buffer).resize(200, 200).jpeg({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(800, 800, { fit: "inside" }).jpeg({ quality: 85 }).toBuffer()
  ]);

  await Promise.all([
    uploadObject(thumbnailKey, thumbnail, "image/jpeg"),
    uploadObject(mediumKey, medium, "image/jpeg")
  ]);

  if (!WorkerDataSource.isInitialized) {
    await WorkerDataSource.initialize();
  }

  const postRepo = WorkerDataSource.getRepository(Post);
  const post = await postRepo.findOne({ where: { id: postId } });

  if (post) {
    post.thumbnailKey = thumbnailKey;
    post.mediumKey = mediumKey;
    await postRepo.save(post);
  }

  return { thumbnailKey, mediumKey };
};

