import { getEnvVar, getEnvVarOrThrow } from "@lib/config";
import { Injectable } from "@nestjs/common";
import {
  NodeSSH,
  SSHExecCommandOptions,
  SSHExecCommandResponse,
} from "node-ssh";
import { toJson } from "xml2json";

import { INmapScanOutput } from "./types/nmap.types";

@Injectable()
export class SshService {
  private readonly ssh = new NodeSSH();

  private async ensureConnected() {
    if (this.ssh.isConnected()) return;

    const host = getEnvVarOrThrow("SSH_HOST");
    const privateKeyBase64 = getEnvVarOrThrow("SSH_KEY");
    const privateKey = Buffer.from(privateKeyBase64, "base64").toString(
      "ascii",
    );
    await this.ssh.connect({
      host,
      port: getEnvVar("SSH_PORT") ?? 22,
      privateKey,
      username: getEnvVar("SSH_USERNAME") ?? "root",
    });
    console.log("connected");
  }

  private async sendCommand(
    command: string,
    opts?: SSHExecCommandOptions,
  ): Promise<SSHExecCommandResponse> {
    await this.ensureConnected();
    try {
      return await this.ssh.execCommand(command, opts && opts);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async scanNetwork() {
    try {
      const command = "sudo nmap -sn -oX - 192.168.1.0/24";
      const xml = await this.sendCommand(command);
      if (xml.stderr) throw new Error(xml.stderr);
      const str = toJson(xml.stdout);
      console.table(this.parseNmapJson(str));
    } catch (error) {
      console.error(error);
    }
  }

  private parseNmapJson(input: string) {
    const json = JSON.parse(input) as INmapScanOutput;
    const nmapHosts = json.nmaprun.host;
    if (!nmapHosts || !Array.isArray(nmapHosts)) return;
    const hosts = nmapHosts
      .map(host => {
        if (!Array.isArray(host.address)) return;
        const ipAddress = host.address.find(
          ({ addrtype }) => addrtype === "ipv4",
        );
        const ip = ipAddress?.addr;

        const macAddress = host.address.find(
          ({ addrtype }) => addrtype === "mac",
        );
        const mac = macAddress?.addr;
        const vendor = macAddress?.vendor;

        let name = "No name";
        if (
          typeof host.hostnames === "object" &&
          host.hostnames.hostname?.name
        ) {
          name = host.hostnames.hostname.name;
        }

        if (!ip || !mac) return;
        return {
          ip,
          mac,
          name,
          ...(vendor && { vendor }),
        };
      })
      .filter(Boolean);

    return hosts;
  }
}
