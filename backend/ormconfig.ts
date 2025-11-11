import "reflect-metadata";
import { DataSource } from "typeorm";
import { getDataSourceOptions } from "./src/config/data-source";

export default new DataSource(getDataSourceOptions());

