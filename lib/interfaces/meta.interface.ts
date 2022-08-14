export interface Meta {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
}
