import { Entity, Column, OneToMany, Index } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Post } from "./Post";
import { Follow } from "./Follow";
import { Like } from "./Like";
import { Comment } from "./Comment";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following!: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers!: Follow[];

  @OneToMany(() => Like, (like) => like.user)
  likes!: Like[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];
}

