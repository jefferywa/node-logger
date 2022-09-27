import * as fs from 'fs';

import { Meta } from '../../interfaces/meta.interface';
import { LoggerSettings } from '../../interfaces/logger.interface';

import { BaseStream } from './base.stream';

export class MapperStream {
  private readonly DEFAULT_WRITE_MODE = 'STDOUT';

  protected readonly _meta: Meta;
  protected readonly _options: LoggerSettings;

  constructor(meta: Meta, options: LoggerSettings) {
    this._options = options;
    this._meta = meta;
  }

  protected _map(record: any): any {
    const {
      msg,
      hostname,
      type,
      zone,
      name,
      time,
      level,
      __meta,
      ...rest
    } = record;

    let data;
    if (Object.keys(rest).length) {
      data = rest;
    }

    return {
      '@timestamp': time,
      source_host: hostname,
      name,
      type,
      zone,
      level: BaseStream.Levels[level],
      level_number: level,
      message: msg,
      data,
      ...__meta,
      ...this._meta.get('log-meta'),
    };
  }

  public write(record: any): void {
    if (this._options.mode && this._options.mode !== this.DEFAULT_WRITE_MODE) {
      const writeStream = fs.createWriteStream(
        `${this._options.path}/${process.pid}.log`,
        {
          flags: 'a',
        },
      );

      writeStream.write(`${JSON.stringify(this._map(record))}\n`);
    } else {
      process.stdout.write(`${JSON.stringify(this._map(record))}\n`);
    }
  }
}
