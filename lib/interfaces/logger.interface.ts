import { LogLevel } from 'bunyan';
import { RecordLikeInterface } from './record-like.interface';

/**
 * Metadata map on `NodeLogger.meta`. Explicit `log-meta` so consumers can use
 * `meta['log-meta']?.requestId` without narrowing errors (backward compatible with loose DTOs).
 */
export type NodeLoggerMeta = RecordLikeInterface & {
  'log-meta'?: RecordLikeInterface;
};

export interface GelfConfig {
  graylogPort: number;
  graylogHostname: string;
  connection: string;
  maxChunkSizeWan: number;
  maxChunkSizeLan: number;
}

export interface LoggerStream {
  type: string;
  level: LogLevel;
  stream: unknown;
}

export interface LoggerSettings {
  name: string;
  type: string;
  mode?: string;
  path?: string;
  level: string | number;
  isTrim: boolean;
  isJSON: boolean;
  isGelf: boolean;
  isMapper: boolean;
  gelfConfig?: GelfConfig;
  maxMessageLength?: number;
  /** Bunyan serializer map; `unknown` keeps compatibility with configs typed as `object`. */
  serializers?: unknown;
  streams?: LoggerStream[];
}

export interface BunyanLoggerOptionsInterface extends RecordLikeInterface {
  name: string;
}
