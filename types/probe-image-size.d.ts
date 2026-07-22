declare module "probe-image-size" {
  import type { Readable } from "node:stream";

  export type ProbeResult = {
    width: number;
    height: number;
    type?: string;
    mime?: string;
    wUnits?: string;
    hUnits?: string;
  } & Record<string, unknown>;

  export default function probe(stream: Readable): Promise<ProbeResult>;
}

