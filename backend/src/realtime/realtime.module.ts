import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { RealtimeController } from "./realtime.controller";
import { RealtimePublisherService } from "./realtime-publisher.service";

@Global()
@Module({
  controllers: [RealtimeController],
  exports: [RealtimePublisherService],
  imports: [ConfigModule, JwtModule.register({})],
  providers: [RealtimePublisherService]
})
export class RealtimeModule {}
