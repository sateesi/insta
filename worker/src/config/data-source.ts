import "reflect-metadata";
import { DataSource } from "typeorm";
import { workerConfig } from "./env";
import { Post } from "../entities/Post";

export const WorkerDataSource = new DataSource({
  type: "postgres",
  host: workerConfig.db.host,
  port: workerConfig.db.port,
  username: workerConfig.db.username,
  password: workerConfig.db.password,
  database: workerConfig.db.database,
  entities: [Post],
  synchronize: false
});

