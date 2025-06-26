import { RedisService, RegisterOptionsDto } from "@lib/nest";
import { Injectable } from "@nestjs/common";

import { ApiDocService } from "./api-doc.service";
import { KrakendGatewayProvider } from "./gateway-providers";

@Injectable()
export class ServiceRecordService {
  constructor(
    private readonly redisService: RedisService,
    private readonly apiDocService: ApiDocService,
    private readonly krakendGateway: KrakendGatewayProvider,
  ) {}

  readonly key = "registry:service";

  readonly generateKey = ({
    host,
    port,
    service,
  }: RegisterOptionsDto): string => {
    return `${this.key}:${service}:${host}:${port}`;
  };

  readonly get = async (
    opts: RegisterOptionsDto,
  ): Promise<RegisterOptionsDto | undefined> => {
    const key = this.generateKey(opts);
    return await this.redisService.get<RegisterOptionsDto>(key, {
      dto: RegisterOptionsDto,
    });
  };

  readonly getAll = async (
    opts: {
      alive?: boolean;
      host?: string;
      port?: string;
      service?: string;
    } = {},
  ): Promise<RegisterOptionsDto[]> => {
    const { alive = false, host = "*", port = "*", service = "*" } = opts;
    const key = this.generateKey({ host, port, service });
    return (
      await this.redisService.getAll<RegisterOptionsDto>(key, {
        dto: RegisterOptionsDto,
      })
    ).filter(dto => (alive ? dto.alive === true : true));
  };

  readonly set = async (dto: RegisterOptionsDto): Promise<void> => {
    const key = this.generateKey(dto);
    await this.redisService.redis.set(key, JSON.stringify(dto));
  };

  readonly getServicesList = async (): Promise<IServiceListItem[]> => {
    const allServicesRecords = await this.getAll({ alive: true });
    const uniqueServices = Array.from(
      new Map(allServicesRecords.map(i => [i.service, i])).values(),
    );
    return uniqueServices.map(({ service }) => ({
      hosts: allServicesRecords
        .filter(r => r.service === service)
        .map(
          ({ host, port }) =>
            `http://${host === "localhost" ? "host.docker.internal" : host}:${port}`,
        ),
      service,
    }));
  };

  async regenerateAll() {
    const services = await this.getServicesList();
    const docs = await this.apiDocService.getAll(services);
    const fullDoc = this.apiDocService.merge(docs);
    if (!fullDoc) return;
    await this.apiDocService.saveFullOpenApiDoc(fullDoc);
    await this.krakendGateway.configure(docs);
  }
}

export interface IServiceListItem {
  hosts: string[];
  service: string;
}
