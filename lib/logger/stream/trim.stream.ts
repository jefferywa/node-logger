import { LoggerSettings } from '../../interfaces/logger.interface';
import { MapperStreamRecordInterface } from './interfaces/mapper-stream-record.interface';
import { LogMetaInterface } from './interfaces/log-meta.interface';

import { MapperStream } from './mapper.stream';

export class TrimStream extends MapperStream {
  private readonly DEFAULT_MAX_MESSAGE_LENGTH = 1024;

  protected readonly _options: LoggerSettings;
  protected readonly _meta: LogMetaInterface;

  constructor(meta: LogMetaInterface, options: LoggerSettings) {
    super(meta, options);

    this._meta = meta;
    this._options = {
      ...options,
      maxMessageLength: options.maxMessageLength
        ? options.maxMessageLength
        : this.DEFAULT_MAX_MESSAGE_LENGTH,
    };
  }

  protected _map(record: MapperStreamRecordInterface): Record<string, unknown> {
    const {
      message,
      level,
      level_number: levelNumber,
      ...rest
    } = super._map(record);

    return {
      level: level,
      level_number: levelNumber,
      message:
        typeof message === 'string' &&
        message.length > (this._options.maxMessageLength ?? 0)
          ? message.slice(0, this._options.maxMessageLength).concat('...')
          : message,
      ...rest,
    };
  }
}
