import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import type { CachedEnvironmentEvaluationSnapshot } from "./evaluation-cache-snapshot";
import { parseCachedEnvironmentEvaluationSnapshot } from "./evaluation-cache-snapshot";
import { getEvaluationCacheConfig } from "./evaluation-cache.config";
import { getEnvironmentEvaluationCacheKey } from "./evaluation-cache-keys";

@Injectable()
export class EvaluationCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly config = getEvaluationCacheConfig();
  private readonly logger = new Logger(EvaluationCacheService.name);
  private readonly redisClient: Redis | null;

  constructor() {
    this.redisClient = this.createRedisClient();
  }

  get ttlSeconds(): number {
    return this.config.ttlSeconds;
  }

  get isEnabled(): boolean {
    return Boolean(this.redisClient);
  }

  async onModuleInit(): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      await this.ensureConnected();
    } catch {
      this.logger.warn("Evaluation cache Redis connection failed; database fallback remains active");
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit().catch(() => undefined);
    }
  }

  getEnvironmentKey(environmentId: string): string {
    return getEnvironmentEvaluationCacheKey(environmentId);
  }

  async readEnvironmentSnapshot(environmentId: string): Promise<CachedEnvironmentEvaluationSnapshot | null> {
    const value = await this.withRedis((redis) => redis.get(this.getEnvironmentKey(environmentId)));

    if (!value) {
      return null;
    }

    return parseCachedEnvironmentEvaluationSnapshot(value);
  }

  async writeEnvironmentSnapshot(snapshot: CachedEnvironmentEvaluationSnapshot): Promise<void> {
    await this.withRedis((redis) =>
      redis.set(this.getEnvironmentKey(snapshot.environment.id), JSON.stringify(snapshot), "EX", this.ttlSeconds)
    );
  }

  async deleteEnvironmentSnapshot(environmentId: string): Promise<void> {
    await this.withRedis((redis) => redis.del(this.getEnvironmentKey(environmentId)));
  }

  async deleteEnvironmentSnapshots(environmentIds: string[]): Promise<void> {
    const uniqueEnvironmentIds = Array.from(new Set(environmentIds.filter(Boolean)));

    if (uniqueEnvironmentIds.length === 0) {
      return;
    }

    await this.withRedis((redis) => redis.del(...uniqueEnvironmentIds.map((environmentId) => this.getEnvironmentKey(environmentId))));
  }

  private createRedisClient(): Redis | null {
    if (!this.config.enabled) {
      return null;
    }

    const options = {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1
    };
    const client = this.config.url
      ? new Redis(this.config.url, options)
      : new Redis(this.config.port, this.config.host, options);

    client.on("error", () => undefined);

    return client;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.redisClient || this.redisClient.status === "ready") {
      return;
    }

    if (this.redisClient.status === "wait") {
      await this.redisClient.connect();
    }
  }

  private async withRedis<T>(operation: (redis: Redis) => Promise<T>): Promise<T | null> {
    if (!this.redisClient) {
      return null;
    }

    try {
      await this.ensureConnected();

      return await operation(this.redisClient);
    } catch {
      this.logger.warn("Evaluation cache operation failed; database fallback remains active");

      return null;
    }
  }
}
