import { configShared } from "@lib/config-shared";
import { RedisModule } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { HealthCheckConsumer, RegistryRequestsConsumer } from "./consumers";
import {
  ApiDocService,
  KeycloakAuthProvider,
  KrakendGatewayProvider,
  ServiceRecordService,
} from "./services";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { keyPrefix, ...bullmqRedisOpts } = configShared.data.redisOptions;

@Module({
  imports: [
    RedisModule.register(configShared.data.redisOptions),
    BullModule.forRoot({
      connection: bullmqRedisOpts,
    }),
    BullModule.registerQueue({
      connection: bullmqRedisOpts,
      name: EQueueRegistry.registryRequests,
    }),
    // BullModule.registerQueue({
    //   connection: bullmqRedisOpts,
    //   name: EQueueRegistry.serviceHealthCheck,
    // }),
  ],
  providers: [
    RegistryRequestsConsumer,
    ApiDocService,
    ServiceRecordService,
    KrakendGatewayProvider,
    HealthCheckConsumer,
    KeycloakAuthProvider,
  ],
})
// implements OnApplicationBootstrap
export class AppModule {
  // constructor(
  //   @InjectQueue(EQueueRegistry.serviceHealthCheck)
  //   private healthCheckQueue: Queue,
  // ) {}
  // async onApplicationBootstrap() {
  //   await this.healthCheckQueue.upsertJobScheduler(
  //     "health-check",
  //     { every: 5000 },
  //     {
  //       opts: { removeOnComplete: true, removeOnFail: true },
  //     },
  //   );
  // }
}
