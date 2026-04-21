import { BaseStreamRecordInterface } from './base-stream-record.interface';

export interface MapperStreamRecordInterface extends BaseStreamRecordInterface {
  msg?: string;
  hostname?: string;
  type?: string;
  zone?: string;
  name?: string;
  time?: string | Date;
  level?: number;
}
