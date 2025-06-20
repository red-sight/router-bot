import { EQueueRegistry } from "@lib/types";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor(EQueueRegistry.routerLeasesList)
export class LeasesListConsumer extends WorkerHost {
  async process(job: Job<unknown, unknown>) {
    // do some stuff
    console.log("=====================", job.data);
    await Promise.resolve(true);
  }

  @OnWorkerEvent("completed")
  onCompleted() {
    // do some stuff
  }
}
