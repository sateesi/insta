import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { ApiError } from "../utils/errorHandler";

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization header missing"));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: payload.userId } });

    if (!user) {
      return next(new ApiError(401, "Invalid token"));
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    return next();
  } catch {
    return next(new ApiError(401, "Invalid token"));
  }
};

