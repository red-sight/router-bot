import { configShared } from "@lib/config-shared";
import { Queue, RedisModule, RegistryClientModule } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { Module, OnApplicationBootstrap } from "@nestjs/common";

import { LeasePingConsumer, LeasesListConsumer } from "./consumers";
import { SshService } from "./services/ssh.service";

const redisOpts = configShared.data.redisOptions;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  imports: [
    RedisModule.register(redisOpts),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.routerLeasesList,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.routerLeasePing,
    }),
    RegistryClientModule.register(),
  ],
  providers: [SshService, LeasesListConsumer, LeasePingConsumer],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    @InjectQueue(EQueueRegistry.routerLeasesList)
    private leasesListQueue: Queue,
  ) {}
  async onApplicationBootstrap() {
    await this.leasesListQueue.upsertJobScheduler(
      "leases-list",
      { every: 60000 },
      {
        opts: { removeOnComplete: true, removeOnFail: true },
      },
    );
  }
}
