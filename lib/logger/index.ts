import Bunyan from 'bunyan';
import { LogLevel } from 'bunyan';

import { randomUUID } from 'node:crypto';

import {
  LoggerSettings,
  BunyanLoggerOptionsInterface,
  NodeLoggerMeta,
} from '../interfaces/logger.interface';
import { RecordLikeInterface } from '../interfaces/record-like.interface';
import { LoggerStreamEntryInterface } from './interfaces/logger-stream-entry.interface';
import {
  LoggerErrorInterface,
  MiddlewareRequestInterface,
  MiddlewareResponseInterface,
  NextFunctionInterface,
} from './interfaces/middleware.interface';
import {
  DEFAULT_LEVEL,
  DEFAULT_NAME_AND_TYPE,
  DEFAULT_STREAM_TYPE,
  EXCEPTION_RESPONSE_POSTFIX,
  INCOMING_REQUEST_POSTFIX,
  SUCCESSFUL_RESPONSE_POSTFIX,
} from './constants';
import { createSerializers } from './serializers';
import {
  createExceptionResponseMiddleware,
  createIncomingRequestMiddleware,
  createSuccessfulResponseMiddleware,
  createSuccessfulShortResponseMiddleware,
} from './middleware.factory';

import { TrimStream } from './stream/trim.stream';
import { BaseStream } from './stream/base.stream';
import { GelfStream } from './stream/gelf.stream';
import { MapperStream } from './stream/mapper.stream';

export class NodeLogger extends Bunyan {
  protected static readonly INCOMING_REQUEST_POSTFIX = INCOMING_REQUEST_POSTFIX;
  protected static readonly SUCCESSFUL_RESPONSE_POSTFIX =
    SUCCESSFUL_RESPONSE_POSTFIX;
  protected static readonly EXCEPTION_RESPONSE_POSTFIX =
    EXCEPTION_RESPONSE_POSTFIX;

  protected static readonly DEFAULT_NAME_AND_TYPE = DEFAULT_NAME_AND_TYPE;
  protected static readonly DEFAULT_STREAM_TYPE = DEFAULT_STREAM_TYPE;
  protected static readonly DEFAULT_LEVEL = DEFAULT_LEVEL;

  /** Set in constructor (root or Bunyan child via `Reflect.construct`). */
  protected _settings!: LoggerSettings;
  /** Internal bag for `setLogMeta`; merged into `meta` getter with Bunyan `fields.__meta`. */
  protected _meta!: RecordLikeInterface;

  declare public streams: LoggerStreamEntryInterface[];
  public middleware!: (
    req: MiddlewareRequestInterface,
    res: MiddlewareResponseInterface,
    next: NextFunctionInterface,
  ) => void;
  public middlewareSuccessfulShortResponse!: (
    req: MiddlewareRequestInterface,
    res: MiddlewareResponseInterface,
    next: NextFunctionInterface,
  ) => void;
  public middlewareSuccessfulResponse!: (
    req: MiddlewareRequestInterface,
    res: MiddlewareResponseInterface,
    next: NextFunctionInterface,
  ) => void;
  public middlewareExceptionResponse!: (
    err: LoggerErrorInterface,
    req: MiddlewareRequestInterface,
    res: MiddlewareResponseInterface,
    next: NextFunctionInterface,
  ) => void;

  /**
   * Root: `new NodeLogger(settings)` → `super(_init(settings, meta))`.
   * Child: Bunyan calls `new NodeLogger(parent, childFields, simple)` from `.child()`.
   * `@types/bunyan` only types the 1-arg ctor, so we invoke Bunyan’s real 3-arg constructor via
   * `Reflect.construct` (same runtime as `super(parent, opts, simple)`) and return that instance.
   */
  constructor(
    settingsOrParent: LoggerSettings | NodeLogger,
    childOptions?: BunyanLoggerOptionsInterface,
    childSimple?: boolean,
  ) {
    if (settingsOrParent instanceof NodeLogger && childOptions !== undefined) {
      const instance = Reflect.construct(
        Bunyan,
        [settingsOrParent, childOptions, childSimple],
        new.target,
      ) as NodeLogger;
      instance._settings = settingsOrParent.settings;
      // Separate from Bunyan `fields.__meta`: `setLogMeta` adds `log-meta` here only.
      instance._meta = {};
      return instance;
    }

    const meta: RecordLikeInterface = {};
    super(
      NodeLogger._init(
        settingsOrParent as LoggerSettings,
        meta,
      ) as BunyanLoggerOptionsInterface,
    );

    this._settings = settingsOrParent as LoggerSettings;
    this._meta = meta;
  }

  get name(): string {
    return this._settings.name;
  }

  get type(): string {
    return this._settings.type;
  }

  get settings(): LoggerSettings {
    return this._settings;
  }

  get meta(): NodeLoggerMeta {
    const fromBunyan =
      typeof this.fields === 'object' &&
      this.fields !== null &&
      '__meta' in this.fields
        ? ((this.fields as Record<string, unknown>)[
            '__meta'
          ] as RecordLikeInterface)
        : {};
    return { ...fromBunyan, ...this._meta } as NodeLoggerMeta;
  }

  static get Serializers() {
    return createSerializers();
  }

  public json(args: unknown, ...rest: unknown[]): void {
    if (!this._settings.isJSON) {
      return;
    }

    let newArgs: [RecordLikeInterface, string?] = [{ level: 70 }];
    if (typeof args === 'string') {
      newArgs = [{ level: 70 }, args];
    }

    if (typeof args !== 'string') {
      newArgs = [{ ...(args as RecordLikeInterface), level: 70 }];
    }

    const concatArgs = newArgs.concat(
      rest as Array<string | RecordLikeInterface | undefined>,
    );
    this.info(concatArgs[0], concatArgs[1]);
  }

  public log(arg: unknown): void {
    this.info(arg);
  }

  public createChild(meta: RecordLikeInterface): NodeLogger {
    const child = this.child({ __meta: meta }, false) as NodeLogger;

    child.flushStreams();
    const childSettings = NodeLogger._init(child.settings, meta);

    (childSettings.streams as unknown as LoggerStreamEntryInterface[]).forEach(
      (stream) => child.addStream(stream as unknown as Bunyan.Stream),
    );
    return child;
  }

  public static create(settings: LoggerSettings): NodeLogger {
    const logger = new NodeLogger(settings).createChild({
      processId: randomUUID(),
    });

    logger.level(settings.level as LogLevel);
    logger.middleware = createIncomingRequestMiddleware(
      logger,
      NodeLogger.INCOMING_REQUEST_POSTFIX,
    );
    logger.middlewareSuccessfulShortResponse =
      createSuccessfulShortResponseMiddleware(
        NodeLogger.SUCCESSFUL_RESPONSE_POSTFIX,
      );
    logger.middlewareSuccessfulResponse = createSuccessfulResponseMiddleware(
      NodeLogger.SUCCESSFUL_RESPONSE_POSTFIX,
    );
    logger.middlewareExceptionResponse = createExceptionResponseMiddleware(
      NodeLogger.EXCEPTION_RESPONSE_POSTFIX,
    );

    return logger;
  }

  public canSend(): boolean {
    return false;
  }

  public flushStreams(): void {
    this.streams = [];
  }

  public setLogMeta(meta: RecordLikeInterface): void {
    this._meta['log-meta'] = meta;

    this.streams.forEach(({ stream }) => {
      (
        stream as {
          setLogMeta: (meta: RecordLikeInterface) => void;
        }
      ).setLogMeta(this._meta);
    });
  }

  private static _init(
    settings: LoggerSettings | NodeLogger,
    meta: RecordLikeInterface,
  ): BunyanLoggerOptionsInterface | NodeLogger {
    if (settings instanceof NodeLogger) {
      return settings;
    }

    const streamList: unknown[] = [];
    const level = (settings.level || NodeLogger.DEFAULT_LEVEL) as LogLevel;

    let serializerList = NodeLogger.Serializers;
    if (settings.serializers) {
      serializerList = Object.assign(
        serializerList,
        settings.serializers as typeof serializerList,
      );
    }

    if (settings.isMapper) {
      streamList.push({
        type: NodeLogger.DEFAULT_STREAM_TYPE,
        level: level,
        stream: this._createStream(settings, meta),
      });
    } else if (settings.streams && settings.streams.length > 0) {
      streamList.push(...settings.streams);
    } else {
      streamList.push({
        type: NodeLogger.DEFAULT_STREAM_TYPE,
        level: level,
        stream: new BaseStream(meta, settings),
      });
    }

    return {
      ...settings,
      name: settings.name || NodeLogger.DEFAULT_NAME_AND_TYPE,
      type: settings.type || NodeLogger.DEFAULT_NAME_AND_TYPE,
      streams: streamList,
      serializers: serializerList,
    } as BunyanLoggerOptionsInterface;
  }

  private static _createStream(
    settings: LoggerSettings,
    meta: RecordLikeInterface,
  ): TrimStream | MapperStream | GelfStream {
    if (settings.isTrim) {
      return new TrimStream(meta, settings);
    }

    if (settings.isGelf && settings.gelfConfig) {
      return new GelfStream(meta, settings);
    }

    return new MapperStream(meta, settings);
  }
}
