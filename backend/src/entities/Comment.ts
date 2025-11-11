import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Post } from "./Post";

@Entity({ name: "comments" })
export class Comment extends BaseEntity {
  @Column({ type: "varchar", length: 280 })
  text!: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  user!: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post!: Post;
}

