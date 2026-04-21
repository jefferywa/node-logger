declare module 'gelf' {
  export default class Gelf {
    constructor(options?: Record<string, unknown>);
    emit(eventName: string, payload: string): void;
  }
}
