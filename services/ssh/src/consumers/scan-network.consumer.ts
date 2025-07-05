import { EQueueRegistry } from "@lib/types";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { NodeSSH } from "node-ssh";
import { SshService } from "src/ssh.service";

@Processor(EQueueRegistry.scanNetwork)
export class ScanNetworkConsumer extends WorkerHost {
  ssh: NodeSSH;

  constructor(private readonly sshService: SshService) {
    super();
    this.ssh = new NodeSSH();
  }

  async process() {
    await this.sshService.scanNetwork();
  }

  @OnWorkerEvent("completed")
  onCompleted() {
    // do some stuff
  }

  @OnWorkerEvent("error")
  onError(e) {
    console.error(e);
  }
}
