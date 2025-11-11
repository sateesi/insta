import { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/userService";

export const handleGetUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.params.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};


