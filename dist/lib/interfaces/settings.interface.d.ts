import { BaseStream } from '../logger/stream/base.stream';
import { MapperStream } from '../logger/stream/mapper.stream';
import { TrimStream } from '../logger/stream/trim.stream';
export interface Settings {
    name: string;
    type: string;
    mode?: string;
    path?: string;
    level: string;
    isTrim: boolean;
    isJSON: boolean;
    isMapper: boolean;
    maxMessageLength?: number;
    serializers: object;
    streams: (BaseStream | MapperStream | TrimStream)[];
}
