import { Entity, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Post } from "./Post";

@Entity({ name: "likes" })
@Unique("UQ_like_user_post", ["user", "post"])
export class Like extends BaseEntity {
  @ManyToOne(() => User, (user) => user.likes, { eager: true })
  user!: User;

  @ManyToOne(() => Post, (post) => post.likes, { eager: true })
  post!: Post;
}

