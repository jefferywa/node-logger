import { LoggerSettings } from '../../interfaces/logger.interface';

import { MapperStream } from './mapper.stream';

export class TrimStream extends MapperStream {
  private readonly DEFAULT_MAX_MESSAGE_LENGTH = 1024;

  protected readonly _options: LoggerSettings;
  protected readonly _meta: object;

  constructor(meta: object, options: LoggerSettings) {
    super(meta, options);

    this._meta = meta;
    this._options = {
      ...options,
      maxMessageLength: options.maxMessageLength
        ? options.maxMessageLength
        : this.DEFAULT_MAX_MESSAGE_LENGTH,
    };
  }

  protected _map(record: any): any {
    const { message, level, level_number: levelNumber, ...rest } = super._map(
      record,
    );

    return {
      level: level,
      level_number: levelNumber,
      message:
        message.length > this._options.maxMessageLength
          ? message.slice(0, this._options.maxMessageLength).concat('...')
          : message,
      ...rest,
    };
  }
}
