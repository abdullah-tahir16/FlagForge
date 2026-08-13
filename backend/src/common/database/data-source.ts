import "reflect-metadata";

import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? "flagforge",
  password: process.env.POSTGRES_PASSWORD ?? "flagforge",
  database: process.env.POSTGRES_DB ?? "flagforge",
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/common/database/migrations/*.ts"],
  synchronize: false,
  ssl: process.env.DATABASE_SSL === "true"
});
