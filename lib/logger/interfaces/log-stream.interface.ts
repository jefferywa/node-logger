import { RecordLikeInterface } from '../../interfaces/record-like.interface';

export interface LogStreamInterface {
  setLogMeta: (meta: RecordLikeInterface) => void;
}
