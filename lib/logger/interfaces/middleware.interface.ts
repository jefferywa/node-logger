import { RecordLikeInterface } from '../../interfaces/record-like.interface';

/** Child logger attached to the request after the incoming-request middleware runs */
export interface MiddlewareAttachedLoggerLike {
  fields?: unknown;
  json: (args: unknown, ...rest: unknown[]) => void;
}

/** Root logger passed into middleware factories (must be able to spawn a per-request child) */
export interface MiddlewareFactoryLoggerLike {
  createChild(meta: RecordLikeInterface): MiddlewareAttachedLoggerLike;
}

export interface MiddlewareRequestInterface {
  headers: Record<string, string | string[] | undefined>;
  url?: string;
  method?: string;
  timeStart?: [number, number];
  requestId?: string;
  log?: MiddlewareAttachedLoggerLike;
}

export interface MiddlewareResponseInterface {
  setHeader: (name: string, value: string) => void;
  result?: unknown;
}

export interface NextFunctionInterface {
  (error?: unknown): void;
}

export interface LoggerErrorInterface {
  name: string;
  stack?: string;
  statusCode?: number;
  message: string | { msg?: string };
}

export interface LoggerFieldsMetaInterface extends RecordLikeInterface {
  __meta?: RecordLikeInterface;
}
