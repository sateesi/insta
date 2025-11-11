import { Request, Response, NextFunction } from "express";
import { likePost, unlikePost } from "../services/likeService";

export const handleLike = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const like = await likePost(req.user.id, req.params.postId);
    res.status(201).json({ id: like.id });
  } catch (error) {
    next(error);
  }
};

export const handleUnlike = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await unlikePost(req.user.id, req.params.postId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

