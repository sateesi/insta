import { Request, Response, NextFunction } from "express";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../services/followService";

export const handleFollow = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const follow = await followUser(req.user.id, req.params.userId);
    res.status(201).json({ id: follow.id });
  } catch (error) {
    next(error);
  }
};

export const handleUnfollow = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await unfollowUser(req.user.id, req.params.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const handleFollowers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followers = await getFollowers(req.params.userId);
    res.json({ items: followers });
  } catch (error) {
    next(error);
  }
};

export const handleFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const following = await getFollowing(req.params.userId);
    res.json({ items: following });
  } catch (error) {
    next(error);
  }
};

