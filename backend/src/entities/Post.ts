import { Entity, Column, ManyToOne, OneToMany, Index } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Like } from "./Like";
import { Comment } from "./Comment";

@Entity({ name: "posts" })
export class Post extends BaseEntity {
  @Column({ type: "varchar", length: 280 })
  caption!: string;

  @Column({ type: "varchar", length: 255 })
  mediaKey!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  thumbnailKey!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  mediumKey!: string | null;

  @Index()
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  author!: User;

  @OneToMany(() => Like, (like) => like.post)
  likes!: Like[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];
}

