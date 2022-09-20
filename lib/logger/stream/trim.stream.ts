import { Meta } from '../../interfaces/meta.interface';
import { LoggerSettings } from '../../interfaces/settings.interface';

import { BaseStream } from './base.stream';
import { MapperStream } from './mapper.stream';

export class TrimStream extends MapperStream {
  private readonly DEFAULT_MAX_MESSAGE_LENGTH = 1024;

  protected readonly _meta: Meta;
  protected readonly _options: LoggerSettings;

  constructor(meta: Meta, options: LoggerSettings) {
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
    const {
      data,
      message,
      level,
      level_number: levelNumber,
      ...rest
    } = super._map(record);

    if (level === BaseStream.Levels[70]) {
      return { data, level, message, ...rest };
    }

    const isLevelE =
      level === BaseStream.Levels[50] && data && Object.keys(data).length === 1;

    if (isLevelE) {
      return { data, level, message, ...rest };
    }

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
