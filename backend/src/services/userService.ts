import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { ApiError } from "../utils/errorHandler";

export const getUserById = async (userId: string) => {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return {
    id: user.id,
    email: user.email,
    username: user.username
  };
};


