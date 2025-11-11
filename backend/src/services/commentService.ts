import { AppDataSource } from "../config/data-source";
import { Comment } from "../entities/Comment";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { ApiError } from "../utils/errorHandler";

export const addComment = async (userId: string, postId: string, text: string) => {
  const commentRepo = AppDataSource.getRepository(Comment);
  const userRepo = AppDataSource.getRepository(User);
  const postRepo = AppDataSource.getRepository(Post);

  const [user, post] = await Promise.all([
    userRepo.findOne({ where: { id: userId } }),
    postRepo.findOne({ where: { id: postId } })
  ]);

  if (!user || !post) {
    throw new ApiError(404, "User or post not found");
  }

  const comment = commentRepo.create({ user, post, text });
  await commentRepo.save(comment);

  return comment;
};

export const listComments = async (postId: string) => {
  const commentRepo = AppDataSource.getRepository(Comment);
  const comments = await commentRepo.find({
    where: { post: { id: postId } },
    relations: ["user"],
    order: { createdAt: "ASC" }
  });

  return comments.map((comment) => ({
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt,
    user: {
      id: comment.user.id,
      username: comment.user.username
    }
  }));
};

