import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "posts" })
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 280 })
  caption!: string;

  @Column({ type: "varchar", length: 255 })
  mediaKey!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  thumbnailKey!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  mediumKey!: string | null;
}

