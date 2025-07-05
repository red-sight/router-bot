export interface INmacScanAddress {
  addr: string;
  addrtype: "ipv4" | "ipv6" | "mac";
  vendor?: string;
}

export interface INmacScanHostnames {
  hostname: {
    name: string;
    type: string;
  };
}

export interface INmapScanHost {
  address: INmacScanAddress | INmacScanAddress[] | "";
  hostnames:
    | {
        hostname?: {
          name?: string;
          type: string;
        };
      }
    | "";
  status: {
    reason: string;
    reason_ttl: string;
    state: string;
  };
  times: {
    rttvar: string;
    srtt: string;
    to: string;
  };
}

export interface INmapScanOutput {
  nmaprun: {
    args: string;
    debugging: {
      level: string;
    };
    host: INmapScanHost | INmapScanHost[] | "";
    runstats: {
      finished: {
        elapsed: string;
        exit: string;
        summary: string;
        time: string;
        timestr: string;
      };
      hosts: {
        down: string;
        total: string;
        up: string;
      };
    };
    scanner: "nmap";
    start: string;
    startstr: string;
    verbose: {
      level: string;
    };
    version: string;
    xmloutputversion: string;
  };
}
