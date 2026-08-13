import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const toBoolean = (value: string | undefined): boolean => value === "true";
const nodeEnv = (): string => process.env.NODE_ENV ?? "development";

export const databaseOptions = (): TypeOrmModuleOptions => ({
  type: "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? "flagforge",
  password: process.env.POSTGRES_PASSWORD ?? "flagforge",
  database: process.env.POSTGRES_DB ?? "flagforge",
  autoLoadEntities: true,
  synchronize: nodeEnv() === "development" && toBoolean(process.env.TYPEORM_SYNCHRONIZE),
  migrations: ["dist/common/database/migrations/*.js"],
  migrationsRun: nodeEnv() === "development" && process.env.TYPEORM_MIGRATIONS_RUN !== "false",
  ssl: toBoolean(process.env.DATABASE_SSL)
});

export const databaseConfig = (): TypeOrmModuleOptions => databaseOptions();
