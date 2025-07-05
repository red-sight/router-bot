import { getEnvVarOrThrow } from "@lib/config";
import { configShared } from "@lib/config-shared";
import { Queue, RedisModule, RegistryClientModule } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ScanNetworkConsumer } from "./consumers/scan-network.consumer";
import { SshService } from "./ssh.service";

const redisOpts = configShared.data.redisOptions;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      database: getEnvVarOrThrow("POSTGRES_DB"),
      host: "localhost",
      password: getEnvVarOrThrow("POSTGRES_PASSWORD"),
      port: parseInt(getEnvVarOrThrow("POSTGRES_PORT")),
      synchronize: true,
      type: "postgres",
      username: getEnvVarOrThrow("POSTGRES_USER"),
    }),
    RedisModule.register(redisOpts),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.scanNetwork,
    }),
    RegistryClientModule.register(),
  ],
  providers: [SshService, ScanNetworkConsumer],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    @InjectQueue(EQueueRegistry.scanNetwork)
    private scanNetworkQueue: Queue,
  ) {}
  async onApplicationBootstrap() {
    await this.scanNetworkQueue.upsertJobScheduler(
      "scan",
      { every: 30000 },
      {
        opts: { removeOnComplete: true, removeOnFail: true },
      },
    );
  }
}
