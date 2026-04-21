import * as fs from 'node:fs';

import { LoggerSettings } from '../../interfaces/logger.interface';
import { RecordLikeInterface } from '../../interfaces/record-like.interface';

import { BaseStream } from './base.stream';
import { LogMetaInterface } from './interfaces/log-meta.interface';
import { MapperStreamRecordInterface } from './interfaces/mapper-stream-record.interface';

export class MapperStream {
  private readonly DEFAULT_WRITE_MODE = 'STDOUT';
  private _fileWriteStream?: fs.WriteStream;
  private _fileWritePath?: string;

  protected _meta: LogMetaInterface;
  protected readonly _options: LoggerSettings;
  protected readonly _optionKeys: Set<string>;

  constructor(meta: LogMetaInterface, options: LoggerSettings) {
    this._options = options;
    this._meta = meta;
    this._optionKeys = new Set(Object.keys(options));
  }

  public setLogMeta(meta: LogMetaInterface): void {
    this._meta = {
      ...this._meta,
      ...meta,
    };
  }

  protected _map(record: MapperStreamRecordInterface): RecordLikeInterface {
    const {
      msg,
      hostname,
      type,
      zone,
      name,
      time,
      level,
      __meta,
      fields,
      _settings,
      _level,
      ...rest
    } = record;
    const normalizedName = name ?? fields?.name ?? _settings?.name;
    const normalizedType = type ?? fields?.type ?? _settings?.type;
    const normalizedTime = time ?? new Date().toISOString();
    const normalizedLevel = level ?? _level ?? 30;
    const normalizedMeta = __meta ?? fields?.__meta;

    let data: RecordLikeInterface | undefined;
    const restKeyList = Object.keys(rest);
    if (restKeyList.length) {
      data = restKeyList.reduce<RecordLikeInterface>((result, key) => {
        if (!this._optionKeys.has(key)) {
          result[key] = rest[key];
        }

        return result;
      }, {});
    }

    return {
      '@timestamp': normalizedTime,
      source_host: hostname,
      name: normalizedName,
      type: normalizedType,
      zone,
      level: BaseStream.Levels[normalizedLevel],
      level_number: normalizedLevel,
      message: msg,
      data,
      ...normalizedMeta,
      ...this._meta['log-meta'],
    };
  }

  private _getFileWriteStream(): fs.WriteStream {
    const path = `${this._options.path}/${process.pid}.log`;
    if (!this._fileWriteStream || this._fileWritePath !== path) {
      this._fileWritePath = path;
      this._fileWriteStream = fs.createWriteStream(path, {
        flags: 'a',
      });
    }

    return this._fileWriteStream;
  }

  public write(record: Object): void {
    if (this._options.mode && this._options.mode !== this.DEFAULT_WRITE_MODE) {
      this._getFileWriteStream().write(
        `${JSON.stringify(this._map(record as MapperStreamRecordInterface))}\n`,
      );
    } else {
      process.stdout.write(
        `${JSON.stringify(this._map(record as MapperStreamRecordInterface))}\n`,
        'utf8',
      );
    }
  }
}
