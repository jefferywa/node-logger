import * as Bunyan from 'bunyan';
import { LoggerOptions, LogLevel } from 'bunyan';

import { v4 as uuidV4 } from 'uuid';
import { Meta } from '../interfaces/meta.interface';
import { LoggerSettings } from '../interfaces/settings.interface';
import { TrimStream } from './stream/trim.stream';
import { MapperStream } from './stream/mapper.stream';
import { BaseStream } from './stream/base.stream';
import { Timer } from '../timer';
import { GelfStream } from './stream/gelf.stream';

const HEADER_RM_REGEX = /(rm=).+?(;|$)/g;
const HEADER_SID_REGEX = /(sid=).+?(;|$)/g;
const HEADER_REPLACE_PATTERN = '$1***$2';
const HEADER_AUTHORIZATION_PATTERN = '***';

export class NodeLogger extends Bunyan {
  protected static readonly INCOMING_REQUEST_POSTFIX = 'INCOMING_REQUEST';
  protected static readonly SUCCESSFUL_RESPONSE_POSTFIX = 'SUCCESSFUL_RESPONSE';
  protected static readonly EXCEPTION_RESPONSE_POSTFIX = 'EXCEPTION_RESPONSE';

  protected static readonly DEFAULT_NAME_AND_TYPE = 'example';
  protected static readonly DEFAULT_STREAM_TYPE = 'raw';
  protected static readonly DEFAULT_LEVEL = 'INFO';

  protected readonly _settings: LoggerSettings;
  protected readonly _meta: Meta;

  public middleware: (req, res, next) => void;
  public middlewareSuccessfulShortResponse: (req, res, next) => void;
  public middlewareSuccessfulResponse: (req, res, next) => void;
  public middlewareExceptionResponse: (err, req, res, next) => void;

  constructor(settingsOrParent: LoggerSettings | NodeLogger, options?: object) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super(NodeLogger._init(settingsOrParent), options);

    if (settingsOrParent instanceof NodeLogger) {
      this._settings = settingsOrParent.settings;
    } else {
      this._settings = settingsOrParent;
    }

    this._meta = NodeLogger._createMeta();
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

  static get Serializers() {
    return {
      header: (headers) => {
        const headerList = { ...headers };

        if (headerList.cookie) {
          headerList.cookie = headerList.cookie
            .replace(HEADER_SID_REGEX, HEADER_REPLACE_PATTERN)
            .replace(HEADER_RM_REGEX, HEADER_REPLACE_PATTERN);
        }

        if (headerList.authorization) {
          headerList.authorization = HEADER_AUTHORIZATION_PATTERN;
        }

        return headerList;
      },
      req: (request) => {
        return {
          url: request.url,
          method: request.method,
          headers: NodeLogger.Serializers.header(request.headers),
        };
      },
      err: (err) => {
        return {
          name: err.name,
          message: JSON.stringify(err.message),
          stack: err.stack,
        };
      },
    };
  }

  public json(args: any, ...rest: any) {
    if (!this._settings.isJSON) {
      return;
    }

    let newArgs;
    if (typeof args === 'string') {
      newArgs = [{ level: 70 }, args];
    }

    if (typeof args !== 'string') {
      newArgs = [{ ...args, level: 70 }];
    }

    const concatArgs = newArgs.concat(rest);
    this.info(concatArgs[0], concatArgs[1]);
  }

  public log(arg: any, ...rest: any) {
    let args = { ...rest };

    if (Array.isArray(rest)) {
      const key = rest[0];
      const value = rest[1];

      args = { [key]: value };
    }

    this.json({ stringData: args }, arg);
  }

  createChild(meta: object): NodeLogger {
    this.setLogMeta(meta);
    return <NodeLogger>this.child({ __meta: meta }, false);
  }

  static create(settings: LoggerSettings): NodeLogger {
    const logger = new NodeLogger(settings).createChild({
      processId: uuidV4(),
    });

    logger.level(settings.level as LogLevel);
    logger.middleware = (req, res, next) => {
      let requestId = req.headers['x-request-id'];
      if (!requestId) {
        requestId = uuidV4();

        res.setHeader('x-request-id', requestId);
      }

      const meta = { requestId };

      req.requestId = requestId;

      req.log = logger.createChild(meta);
      req.log.json({ req }, this.INCOMING_REQUEST_POSTFIX);

      next();
    };

    logger.middlewareSuccessfulShortResponse = (req, res, next) => {
      if (!req.requestId || !req.timeStart) {
        return next();
      }

      const time = Timer.hrtimeToMs(process.hrtime(req.timeStart));

      req.log.json(
        { secureJsonData: { code: 200, meta: { time } } },
        this.SUCCESSFUL_RESPONSE_POSTFIX,
      );

      next();
    };

    logger.middlewareSuccessfulResponse = (req, res, next) => {
      if (!req.requestId || !req.timeStart) {
        return next();
      }

      const time = Timer.hrtimeToMs(process.hrtime(req.timeStart));
      if (!res.result && res.result !== null) {
        return next();
      }

      if (res.result.stream) {
        return next();
      }

      req.log.json(
        {
          secureJsonData: {
            code: 200,
            result: res.result,
            meta: {
              requestId: req.requestId,
              time: time,
            },
          },
        },
        this.SUCCESSFUL_RESPONSE_POSTFIX,
      );

      next();
    };

    logger.middlewareExceptionResponse = (err, req, res, next) => {
      if (!req.requestId || !req.timeStart) {
        return next();
      }

      const time = Timer.hrtimeToMs(process.hrtime(req.timeStart));

      const errorMessage = err.message.msg || err.message;
      const errorCode = !err.statusCode ? 400 : err.statusCode;

      req.log.json(
        {
          secureJsonData: {
            error: {
              code: errorCode,
              name: err.name,
              message: errorMessage,
            },
            meta: {
              requestId: req.requestId,
              time: time,
            },
          },
        },
        this.EXCEPTION_RESPONSE_POSTFIX,
      );

      next(err);
    };

    return logger;
  }

  public canSend(): boolean {
    return false;
  }

  static _init(
    settings: LoggerSettings | NodeLogger,
  ): LoggerOptions | NodeLogger {
    if (settings instanceof NodeLogger) {
      return settings;
    }

    const meta = this._createMeta();
    const streamList = [];

    const level = settings.level || NodeLogger.DEFAULT_LEVEL;

    let serializerList = NodeLogger.Serializers;
    if (settings.serializers) {
      serializerList = Object.assign(serializerList, settings.serializers);
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
        stream: new BaseStream(meta),
      });
    }

    return {
      name: settings.name || NodeLogger.DEFAULT_NAME_AND_TYPE,
      type: settings.type || NodeLogger.DEFAULT_NAME_AND_TYPE,
      streams: streamList,
      serializers: serializerList,
    };
  }

  private static _createMeta(): Meta {
    const emptyMetaObject = {};

    return {
      get: (key: string) => emptyMetaObject[key],
      set: (key: string, value: any) => (emptyMetaObject[key] = value),
    };
  }

  private static _createStream(
    settings: LoggerSettings,
    meta: Meta,
  ): TrimStream | MapperStream | GelfStream {
    if (settings.isTrim) {
      return new TrimStream(meta, settings);
    }

    if (settings.isGelf && settings.gelfConfig) {
      return new GelfStream(meta, settings);
    }

    return new MapperStream(meta, settings);
  }

  public setLogMeta(meta: object): void {
    this._meta.set('log-meta', meta);
  }
}
