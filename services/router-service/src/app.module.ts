import { configShared } from "@lib/config-shared";
import { Queue, RedisModule, RegistryClientModule } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { Module, OnApplicationBootstrap } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LeasesListConsumer } from "./consumers";

const redisOpts = configShared.data.redisOptions;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  controllers: [AppController],
  imports: [
    RedisModule.register(redisOpts),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.routerLeasesList,
    }),
    RegistryClientModule.register(),
  ],
  providers: [AppService, LeasesListConsumer],
})
//
export class AppModule implements OnApplicationBootstrap {
  constructor(
    @InjectQueue(EQueueRegistry.routerLeasesList)
    private leasesListQueue: Queue,
  ) {}
  async onApplicationBootstrap() {
    await this.leasesListQueue.upsertJobScheduler(
      "leases-list",
      { every: 5000 },
      {
        opts: { removeOnComplete: true, removeOnFail: true },
      },
    );
  }
}
