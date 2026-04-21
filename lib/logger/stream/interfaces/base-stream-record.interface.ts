import { RecordLikeInterface } from '../../../interfaces/record-like.interface';

export interface StreamFieldsInterface {
  name?: string;
  type?: string;
  __meta?: Record<string, unknown>;
}

export interface StreamSettingsInterface {
  name?: string;
  type?: string;
}

export interface BaseStreamRecordInterface extends RecordLikeInterface {
  name?: string;
  type?: string;
  msg?: string;
  level?: number;
  __meta?: Record<string, unknown>;
  fields?: StreamFieldsInterface;
  _settings?: StreamSettingsInterface;
  _level?: number;
}
