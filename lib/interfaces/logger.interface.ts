import { LogLevel, LogLevelString } from 'bunyan';

import { BaseStream } from '../logger/stream/base.stream';
import { TrimStream } from '../logger/stream/trim.stream';
import { GelfStream } from '../logger/stream/gelf.stream';
import { MapperStream } from '../logger/stream/mapper.stream';

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
  stream: BaseStream | TrimStream | MapperStream | GelfStream;
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
  serializers: object;
  streams?: LoggerStream[];
}

export interface LoggerOptions {
  [key: string]: any;
}
