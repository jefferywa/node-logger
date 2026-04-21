import Gelf from 'gelf';

import { LoggerSettings } from '../../interfaces/logger.interface';
import { MapperStreamRecordInterface } from './interfaces/mapper-stream-record.interface';
import { LogMetaInterface } from './interfaces/log-meta.interface';

import { MapperStream } from './mapper.stream';

export class GelfStream extends MapperStream {
  private readonly _gelf: {
    emit: (eventName: string, payload: string) => void;
  };

  protected readonly _options: LoggerSettings;
  protected readonly _meta: LogMetaInterface;

  constructor(meta: LogMetaInterface, options: LoggerSettings) {
    super(meta, options);

    this._gelf = new Gelf(
      options.gelfConfig as unknown as Record<string, unknown>,
    ) as {
      emit: (eventName: string, payload: string) => void;
    };
    this._options = options;
    this._meta = meta;
  }

  public write(record: Object): void {
    this._gelf.emit(
      'gelf.log',
      `${JSON.stringify(this._map(record as MapperStreamRecordInterface))}\n`,
    );
  }
}
