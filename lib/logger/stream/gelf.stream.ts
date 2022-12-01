import * as Gelf from 'gelf';

import { LoggerSettings } from '../../interfaces/logger.interface';

import { MapperStream } from './mapper.stream';

export class GelfStream extends MapperStream {
  private readonly _gelf: Gelf;

  protected readonly _options: LoggerSettings;
  protected readonly _meta: object;

  constructor(meta: object, options: LoggerSettings) {
    super(meta, options);

    this._gelf = new Gelf(options.gelfConfig);
    this._options = options;
    this._meta = meta;
  }

  public write(record: any): void {
    this._gelf.emit('gelf.log', `${JSON.stringify(this._map(record))}\n`);
  }
}
