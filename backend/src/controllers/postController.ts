import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { createPost, getFeed, getPostsByUser } from "../services/postService";
import { getPublicUrl } from "../services/storageService";

export const handleCreatePost = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const post = await createPost({
      userId: req.user.id,
      caption: req.body.caption,
      file: req.file as Express.Multer.File
    });

    res.status(201).json({
      id: post.id,
      caption: post.caption,
      mediaUrl: getPublicUrl(post.mediaKey),
      thumbnailUrl: post.thumbnailKey ? getPublicUrl(post.thumbnailKey) : null,
      mediumUrl: post.mediumKey ? getPublicUrl(post.mediumKey) : null
    });
  } catch (error) {
    next(error);
  }
};

export const handleFeed = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const feed = await getFeed(req.user.id, page, limit);
    res.json(feed);
  } catch (error) {
    next(error);
  }
};

export const handleProfilePosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await getPostsByUser(req.params.userId, req.user?.id);
    res.json({ items: posts });
  } catch (error) {
    next(error);
  }
};

