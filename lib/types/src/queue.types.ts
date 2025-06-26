export enum EQueueRegistry {
  registryRequests = "registry.requests",
  serviceHealthCheck = "registry.service.health",
  routerLeasesList = "router.leases.list",
  routerLeasePing = "router.lease.ping",
}

export enum ERegistryStoreKey {
  openApiDoc = "openapidoc",
}

export interface IRegistryRequest {
  host: string;
  port: string;
  service: string;
}

export interface IServiceRecord extends IRegistryRequest {
  alive: boolean;
}
