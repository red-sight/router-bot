import { getEnvVarOrThrow } from "@lib/config";
import { Injectable } from "@nestjs/common";
import {
  NodeSSH,
  SSHExecCommandOptions,
  SSHExecCommandResponse,
} from "node-ssh";

@Injectable()
export class SshService {
  private ssh = new NodeSSH();

  async ensureConnected() {
    if (this.ssh.isConnected()) return;

    const host = getEnvVarOrThrow("SSH_HOST");
    const privateKeyBase64 = getEnvVarOrThrow("SSH_KEY");
    const privateKey = Buffer.from(privateKeyBase64, "base64").toString(
      "ascii",
    );
    await this.ssh.connect({
      host,
      privateKey,
      username: "root",
    });
  }

  private async sendCommand(
    command: string,
    opts?: SSHExecCommandOptions,
  ): Promise<SSHExecCommandResponse> {
    await this.ensureConnected();
    return await this.ssh.execCommand(command, opts && opts);
    // console.log("RES", res);
    // if (res.stderr) throw new Error(res.stderr);
    // return res.stdout;
  }

  async getLeasesList(): Promise<ILease[]> {
    await this.ensureConnected();

    const res = await this.sendCommand("cat /tmp/dhcp.leases");
    if (res.stderr) throw new Error(res.stderr);

    const leases = res.stdout
      .split("\n")
      .map(line => line.replace(/^.*?:\s*/, "").trim()) // remove logger prefix
      .filter(Boolean)
      .map(line => {
        const [mac, ip, device] = line.split(" ");
        return { device, ip, mac };
      });

    return leases;
  }

  async ping(ip: string, { timeout = 2 }: { timeout?: number } = {}) {
    try {
      const res = await this.sendCommand(`ping ${ip} -w ${timeout.toString()}`);
      return res;
    } catch (error) {
      console.error(error);
    }
  }
}

export interface ILease {
  device: string;
  ip: string;
  mac: string;
}
