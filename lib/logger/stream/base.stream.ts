export class BaseStream {
  protected _meta: object;

  constructor(meta: object) {
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
    const { msg, level, __meta, ...rest } = record;

    return {
      '@timestamp': new Date(),
      ...rest,
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
