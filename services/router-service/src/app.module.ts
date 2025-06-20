import { configShared } from "@lib/config-shared";
import { RedisModule, RegistryClientModule } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

const redisOpts = configShared.data.redisOptions;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  controllers: [AppController],
  imports: [
    RedisModule.register(redisOpts),
    RegistryClientModule.register(),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.registryRequests,
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
