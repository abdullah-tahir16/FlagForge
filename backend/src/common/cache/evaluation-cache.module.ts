import { Global, Module } from "@nestjs/common";
import { EvaluationCacheService } from "./evaluation-cache.service";

@Global()
@Module({
  exports: [EvaluationCacheService],
  providers: [EvaluationCacheService]
})
export class EvaluationCacheModule {}
