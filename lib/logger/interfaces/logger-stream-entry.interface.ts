import { LogLevel } from 'bunyan';
import { LogStreamInterface } from './log-stream.interface';

export interface LoggerStreamEntryInterface {
  type: string;
  level: LogLevel;
  stream: LogStreamInterface;
}
