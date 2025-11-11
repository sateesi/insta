import { AppDataSource } from "../config/data-source";
import { Follow } from "../entities/Follow";
import { User } from "../entities/User";
import { ApiError } from "../utils/errorHandler";

export const followUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw new ApiError(400, "Cannot follow yourself");
  }

  const followRepo = AppDataSource.getRepository(Follow);
  const userRepo = AppDataSource.getRepository(User);

  const follower = await userRepo.findOne({ where: { id: followerId } });
  const following = await userRepo.findOne({ where: { id: followingId } });

  if (!follower || !following) {
    throw new ApiError(404, "User not found");
  }

  const existing = await followRepo.findOne({ where: { follower: { id: followerId }, following: { id: followingId } } });
  if (existing) {
    return existing;
  }

  const follow = followRepo.create({ follower, following });
  return followRepo.save(follow);
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const followRepo = AppDataSource.getRepository(Follow);
  const existing = await followRepo.findOne({ where: { follower: { id: followerId }, following: { id: followingId } } });

  if (!existing) {
    throw new ApiError(404, "Follow relationship not found");
  }

  await followRepo.remove(existing);
};

export const getFollowers = async (userId: string) => {
  const followRepo = AppDataSource.getRepository(Follow);
  const follows = await followRepo.find({ where: { following: { id: userId } }, relations: ["follower"] });
  return follows.map((follow) => ({ id: follow.follower.id, username: follow.follower.username }));
};

export const getFollowing = async (userId: string) => {
  const followRepo = AppDataSource.getRepository(Follow);
  const follows = await followRepo.find({ where: { follower: { id: userId } }, relations: ["following"] });
  return follows.map((follow) => ({ id: follow.following.id, username: follow.following.username }));
};

