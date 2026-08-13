import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const toBoolean = (value: string | undefined): boolean => value === "true";

export const databaseOptions = (): TypeOrmModuleOptions => ({
  type: "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? "flagforge",
  password: process.env.POSTGRES_PASSWORD ?? "flagforge",
  database: process.env.POSTGRES_DB ?? "flagforge",
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== "production" && toBoolean(process.env.TYPEORM_SYNCHRONIZE),
  migrations: ["dist/common/database/migrations/*.js"],
  migrationsRun: false,
  ssl: toBoolean(process.env.DATABASE_SSL)
});

export const databaseConfig = (): TypeOrmModuleOptions => databaseOptions();
