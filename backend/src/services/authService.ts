import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { config } from "../config/env";
import { User } from "../entities/User";
import { ApiError } from "../utils/errorHandler";
import { hashPassword, comparePassword } from "../utils/password";
import { AuthResponse } from "../types";

interface SignupInput {
  email: string;
  username: string;
  password: string;
}

export const registerUser = async ({ email, username, password }: SignupInput): Promise<AuthResponse> => {
  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.findOne({ where: [{ email }, { username }] });

  if (existing) {
    throw new ApiError(409, "Email or username already in use");
  }

  const passwordHash = await hashPassword(password);
  const user = userRepo.create({ email, username, passwordHash });
  await userRepo.save(user);

  return buildAuthResponse(user);
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid credentials");
  }

  return buildAuthResponse(user);
};

const buildAuthResponse = (user: User): AuthResponse => {
  const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });

  const refreshToken = jwt.sign({ userId: user.id, email: user.email }, config.refreshSecret, {
    expiresIn: config.refreshExpiresIn
  });

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    }
  };
};

