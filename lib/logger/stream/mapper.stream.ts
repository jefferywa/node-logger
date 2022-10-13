import * as fs from 'fs';

import { LoggerSettings } from '../../interfaces/logger.interface';

import { BaseStream } from './base.stream';

export class MapperStream {
  private readonly DEFAULT_WRITE_MODE = 'STDOUT';

  protected _meta: object;
  protected readonly _options: LoggerSettings;

  constructor(meta: object, options: LoggerSettings) {
    this._options = options;
    this._meta = meta;
  }

  public setLogMeta(meta: object) {
    this._meta = {
      ...this._meta,
      ...meta,
    };
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
    const restKeyList = Object.keys(rest);
    if (restKeyList.length) {
      data = restKeyList.reduce((result, key) => {
        if (!this._options.hasOwnProperty(key)) {
          result[key] = rest[key];
        }

        return result;
      }, {});
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
      ...this._meta['log-meta'],
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
