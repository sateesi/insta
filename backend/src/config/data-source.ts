import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "./env";
import { User } from "../entities/User";
import { Post } from "../entities/Post";
import { Follow } from "../entities/Follow";
import { Like } from "../entities/Like";
import { Comment } from "../entities/Comment";

const common: Partial<DataSourceOptions> = {
  entities: [User, Post, Follow, Like, Comment],
  synchronize: true,
  logging: false
};

const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);

const options: DataSourceOptions = isTest
  ? {
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      ...common
    }
  : {
      type: "postgres",
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.name,
      ...common
    };

export const AppDataSource = new DataSource(options);

export const getDataSourceOptions = (): DataSourceOptions => options;

