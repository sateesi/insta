import { AppDataSource } from "../config/data-source";
import { Like } from "../entities/Like";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { ApiError } from "../utils/errorHandler";

export const likePost = async (userId: string, postId: string) => {
  const likeRepo = AppDataSource.getRepository(Like);
  const userRepo = AppDataSource.getRepository(User);
  const postRepo = AppDataSource.getRepository(Post);

  const [user, post] = await Promise.all([
    userRepo.findOne({ where: { id: userId } }),
    postRepo.findOne({ where: { id: postId } })
  ]);

  if (!user || !post) {
    throw new ApiError(404, "User or post not found");
  }

  const existing = await likeRepo.findOne({ where: { user: { id: userId }, post: { id: postId } } });
  if (existing) {
    return existing;
  }

  const like = likeRepo.create({ user, post });
  return likeRepo.save(like);
};

export const unlikePost = async (userId: string, postId: string) => {
  const likeRepo = AppDataSource.getRepository(Like);
  const existing = await likeRepo.findOne({ where: { user: { id: userId }, post: { id: postId } } });

  if (!existing) {
    throw new ApiError(404, "Like not found");
  }

  await likeRepo.remove(existing);
};

