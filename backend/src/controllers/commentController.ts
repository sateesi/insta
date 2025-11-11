import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { addComment, listComments } from "../services/commentService";

export const handleAddComment = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const comment = await addComment(req.user.id, req.params.postId, req.body.text);
    res.status(201).json({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt
    });
  } catch (error) {
    next(error);
  }
};

export const handleListComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await listComments(req.params.postId);
    res.json({ items: comments });
  } catch (error) {
    next(error);
  }
};

