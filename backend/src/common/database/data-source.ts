import "reflect-metadata";

import { DataSource } from "typeorm";

const sourceExtension = __filename.endsWith(".ts") ? "ts" : "js";
const sourceRoot = sourceExtension === "ts" ? "src" : "dist";

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? "flagforge",
  password: process.env.POSTGRES_PASSWORD ?? "flagforge",
  database: process.env.POSTGRES_DB ?? "flagforge",
  entities: [`${sourceRoot}/**/*.entity.${sourceExtension}`],
  migrations: [`${sourceRoot}/common/database/migrations/*.${sourceExtension}`],
  synchronize: false,
  ssl: process.env.DATABASE_SSL === "true"
});
