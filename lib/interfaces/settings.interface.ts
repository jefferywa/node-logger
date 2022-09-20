import { BaseStream } from '../logger/stream/base.stream';
import { MapperStream } from '../logger/stream/mapper.stream';
import { TrimStream } from '../logger/stream/trim.stream';

export interface GelfConfig {
  graylogPort: number;
  graylogHostname: string;
  connection: string;
  maxChunkSizeWan: number;
  maxChunkSizeLan: number;
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
  streams?: (BaseStream | MapperStream | TrimStream)[];
}
