import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { config } from "./env";
import { User } from "../entities/User";
import { Post } from "../entities/Post";
import { Follow } from "../entities/Follow";
import { Like } from "../entities/Like";
import { Comment } from "../entities/Comment";

const common: Pick<DataSourceOptions, "entities" | "synchronize" | "logging"> = {
  entities: [User, Post, Follow, Like, Comment],
  synchronize: true,
  logging: false
};

const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);

const testOptions: SqliteConnectionOptions = {
  type: "sqlite",
  database: ":memory:",
  dropSchema: true,
  ...common
};

const postgresOptions: PostgresConnectionOptions = {
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  ...common
};

const options: DataSourceOptions = (isTest ? testOptions : postgresOptions) as DataSourceOptions;

export const AppDataSource = new DataSource(options);

export const getDataSourceOptions = (): DataSourceOptions => options;

