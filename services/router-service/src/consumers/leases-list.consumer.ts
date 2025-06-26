import { Queue } from "@lib/nest";
import { EQueueRegistry } from "@lib/types";
import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from "@nestjs/bullmq";
import { NodeSSH } from "node-ssh";
import { SshService } from "src/services/ssh.service";

@Processor(EQueueRegistry.routerLeasesList)
export class LeasesListConsumer extends WorkerHost {
  ssh: NodeSSH;

  constructor(
    private readonly sshService: SshService,
    @InjectQueue(EQueueRegistry.routerLeasePing)
    private leasePingQueue: Queue,
  ) {
    super();
    this.ssh = new NodeSSH();
  }

  async process() {
    const leases = await this.sshService.getLeasesList();
    console.log("leases", leases);
    leases.forEach(lease => void this.leasePingQueue.add(lease.device, lease));
  }

  @OnWorkerEvent("completed")
  onCompleted() {
    // do some stuff
  }
}
