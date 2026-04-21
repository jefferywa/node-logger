import { LoggerSettings } from '../../interfaces/logger.interface';
import { RecordLikeInterface } from '../../interfaces/record-like.interface';
import { BaseStreamRecordInterface } from './interfaces/base-stream-record.interface';
import { LogMetaInterface } from './interfaces/log-meta.interface';

export class BaseStream {
  protected _meta: LogMetaInterface;
  protected readonly _options: LoggerSettings;
  protected readonly _optionKeys: Set<string>;

  constructor(meta: LogMetaInterface, options: LoggerSettings) {
    this._options = options;
    this._meta = meta;
    this._optionKeys = new Set(Object.keys(options));
  }

  public static get Levels(): Record<number, string> {
    return {
      70: 'Z',
      50: 'E',
      40: 'W',
      30: 'I',
      20: 'D',
      10: 'T',
    };
  }

  public setLogMeta(meta: LogMetaInterface): void {
    this._meta = {
      ...this._meta,
      ...meta,
    };
  }

  protected _map(record: BaseStreamRecordInterface): RecordLikeInterface {
    const {
      name,
      type,
      msg,
      level,
      __meta,
      fields,
      _settings,
      _level,
      ...rest
    } = record;
    const normalizedName = name ?? fields?.name ?? _settings?.name;
    const normalizedType = type ?? fields?.type ?? _settings?.type;
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
      '@timestamp': new Date(),
      ...data,
      name: normalizedName,
      type: normalizedType,
      level: BaseStream.Levels[normalizedLevel],
      msg,
      level_number: normalizedLevel,
      ...normalizedMeta,
      ...this._meta['log-meta'],
    };
  }

  public write(record: Object): void {
    process.stdout.write(
      `${JSON.stringify(this._map(record as BaseStreamRecordInterface))}\n`,
      'utf8',
    );
  }
}
