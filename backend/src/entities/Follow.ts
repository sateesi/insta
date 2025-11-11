import { Entity, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Entity({ name: "follows" })
@Unique("UQ_follow_pair", ["follower", "following"])
export class Follow extends BaseEntity {
  @ManyToOne(() => User, (user) => user.following, { eager: true })
  follower!: User;

  @ManyToOne(() => User, (user) => user.followers, { eager: true })
  following!: User;
}

