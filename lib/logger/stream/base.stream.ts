import { LoggerSettings } from '../../interfaces/logger.interface';

export class BaseStream {
  protected _meta: object;
  protected readonly _options: LoggerSettings;

  constructor(meta: object, options: LoggerSettings) {
    this._options = options;
    this._meta = meta;
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

  public setLogMeta(meta: object) {
    this._meta = {
      ...this._meta,
      ...meta,
    };
  }

  protected _map(record: any): any {
    const { name, type, msg, level, __meta, ...rest } = record;

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
      '@timestamp': new Date(),
      ...data,
      name,
      type,
      level: BaseStream.Levels[level],
      msg,
      level_number: level,
      ...__meta,
      ...this._meta['log-meta'],
    };
  }

  public write(record: any): void {
    process.stdout.write(`${JSON.stringify(this._map(record))}\n`);
  }
}
