import { Job } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { ILease, SshService } from "src/services/ssh.service";

@Processor(EQueueRegistry.routerLeasePing, { concurrency: 5 })
export class LeasePingConsumer extends WorkerHost {
  constructor(private readonly sshService: SshService) {
    super();
  }
  async process(job: Job<ILease, unknown>) {
    const res = await this.sshService.ping(job.data.ip);
    console.log("DEVICE:", job.data.device, "online:", res?.code === 0);
    await Promise.resolve();
  }
}
