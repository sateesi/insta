import { In } from "typeorm";
import mime from "mime-types";
import { AppDataSource } from "../config/data-source";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Follow } from "../entities/Follow";
import { ApiError } from "../utils/errorHandler";
import { uploadBuffer, getPublicUrl } from "./storageService";
import { enqueueImageJob } from "../queues/imageQueue";
import { FeedItem } from "../types";

interface CreatePostInput {
  userId: string;
  caption: string;
  file: Express.Multer.File;
}

export const createPost = async ({ userId, caption, file }: CreatePostInput) => {
  if (!file) {
    throw new ApiError(400, "Image file is required");
  }

  if (!file.mimetype.startsWith("image/")) {
    throw new ApiError(400, "File must be an image");
  }

  const ext = mime.extension(file.mimetype) || "jpg";
  const mediaKey = `uploads/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  await uploadBuffer(mediaKey, file.buffer, file.mimetype);

  const postRepo = AppDataSource.getRepository(Post);
  const userRepo = AppDataSource.getRepository(User);
  const author = await userRepo.findOne({ where: { id: userId } });

  if (!author) {
    throw new ApiError(404, "User not found");
  }

  const post = postRepo.create({ caption, mediaKey, author, thumbnailKey: null, mediumKey: null });
  await postRepo.save(post);

  await enqueueImageJob({ postId: post.id, mediaKey });

  return post;
};

export const getFeed = async (userId: string, page = 1, limit = 10): Promise<{ items: FeedItem[]; total: number }> => {
  const followRepo = AppDataSource.getRepository(Follow);
  const postRepo = AppDataSource.getRepository(Post);

  const followings = await followRepo.find({ where: { follower: { id: userId } }, relations: ["following"] });
  const followingIds = followings.map((f) => f.following.id);
  followingIds.push(userId);

  const [posts, total] = await postRepo.findAndCount({
    where: { author: { id: In(followingIds) } },
    relations: ["author", "likes", "comments"],
    order: { createdAt: "DESC" },
    skip: (page - 1) * limit,
    take: limit
  });

  const items: FeedItem[] = posts.map((post) => ({
    id: post.id,
    caption: post.caption,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      username: post.author.username
    },
    mediaUrl: getPublicUrl(post.mediaKey),
    thumbnailUrl: post.thumbnailKey ? getPublicUrl(post.thumbnailKey) : null,
    mediumUrl: post.mediumKey ? getPublicUrl(post.mediumKey) : null,
    likeCount: post.likes?.length ?? 0,
    commentCount: post.comments?.length ?? 0,
    likedByCurrentUser: Boolean(post.likes?.some((like) => like.user.id === userId))
  }));

  return { items, total };
};

export const getPostsByUser = async (userId: string, viewerId?: string) => {
  const postRepo = AppDataSource.getRepository(Post);
  const posts = await postRepo.find({
    where: { author: { id: userId } },
    relations: ["author", "likes", "comments"],
    order: { createdAt: "DESC" }
  });

  return posts.map((post) => ({
    id: post.id,
    caption: post.caption,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      username: post.author.username
    },
    mediaUrl: getPublicUrl(post.mediaKey),
    thumbnailUrl: post.thumbnailKey ? getPublicUrl(post.thumbnailKey) : null,
    mediumUrl: post.mediumKey ? getPublicUrl(post.mediumKey) : null,
    likeCount: post.likes?.length ?? 0,
    commentCount: post.comments?.length ?? 0,
    likedByCurrentUser: viewerId ? Boolean(post.likes?.some((like) => like.user.id === viewerId)) : false
  }));
};

export const updatePostMedia = async (postId: string, thumbnailKey: string, mediumKey: string) => {
  const postRepo = AppDataSource.getRepository(Post);
  const post = await postRepo.findOne({ where: { id: postId } });
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  post.thumbnailKey = thumbnailKey;
  post.mediumKey = mediumKey;
  await postRepo.save(post);
};

export const getPostById = async (postId: string) => {
  const postRepo = AppDataSource.getRepository(Post);
  return postRepo.findOne({ where: { id: postId }, relations: ["author", "likes", "comments"] });
};

