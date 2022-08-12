"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeLogger = void 0;
const Bunyan = require("bunyan");
const uuid_1 = require("uuid");
const trim_stream_1 = require("./stream/trim.stream");
const mapper_stream_1 = require("./stream/mapper.stream");
const base_stream_1 = require("./stream/base.stream");
const timer_1 = require("../timer");
const HEADER_RM_REGEX = /(rm=).+?(;|$)/g;
const HEADER_SID_REGEX = /(sid=).+?(;|$)/g;
const HEADER_REPLACE_PATTERN = '$1***$2';
const HEADER_AUTHORIZATION_PATTERN = '***';
class NodeLogger extends Bunyan {
    constructor(settings) {
        super(NodeLogger._init(settings));
        this._settings = settings;
        if (settings instanceof NodeLogger) {
            this._settings = settings._extractSettings;
        }
        this._meta = NodeLogger._createMeta();
    }
    static get Serializers() {
        return {
            header: (headers) => {
                const headerList = Object.assign({}, headers);
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
    json(args, ...rest) {
        if (!this._settings.isJSON) {
            return;
        }
        let newArgs;
        if (typeof args === 'string') {
            newArgs = [{ level: 70 }, args];
        }
        if (typeof args !== 'string') {
            newArgs = [Object.assign(Object.assign({}, args), { level: 70 })];
        }
        const concatArgs = newArgs.concat(rest);
        this.info(concatArgs[0], concatArgs[1]);
    }
    log(arg, ...rest) {
        let args = Object.assign({}, rest);
        if (Array.isArray(rest)) {
            const key = rest[0];
            const value = rest[1];
            args = { [key]: value };
        }
        this.json({ stringData: args }, arg);
    }
    static create(settings) {
        const logger = new NodeLogger(settings);
        logger.level(settings.level);
        logger.middleware = (req, res, next) => {
            let requestId = req.headers['x-request-id'];
            if (!requestId) {
                requestId = (0, uuid_1.v4)();
                res.setHeader('x-request-id', requestId);
            }
            const meta = { requestId };
            logger._setLogMeta(meta);
            req.requestId = requestId;
            req.log = logger.child({ __meta: meta, className: 'server' }, false);
            req.log.json({ req }, this.INCOMING_REQUEST_POSTFIX);
            next();
        };
        logger.middlewareSuccessfulShortResponse = (req, res, next) => {
            if (!req.requestId || !req.timeStart) {
                return next();
            }
            const time = timer_1.Timer.hrtimeToMs(process.hrtime(req.timeStart));
            req.log.json({ secureJsonData: { code: 200, meta: { time } } }, this.SUCCESSFUL_RESPONSE_POSTFIX);
            next();
        };
        logger.middlewareSuccessfulResponse = (req, res, next) => {
            if (!req.requestId || !req.timeStart) {
                return next();
            }
            const time = timer_1.Timer.hrtimeToMs(process.hrtime(req.timeStart));
            if (!res.result && res.result !== null) {
                return next();
            }
            if (res.result.stream) {
                return next();
            }
            req.log.json({
                secureJsonData: {
                    code: 200,
                    result: res.result,
                    meta: {
                        requestId: req.requestId,
                        time: time,
                    },
                },
            }, this.SUCCESSFUL_RESPONSE_POSTFIX);
            next();
        };
        logger.middlewareExceptionResponse = (err, req, res, next) => {
            if (!req.requestId || !req.timeStart) {
                return next();
            }
            const time = timer_1.Timer.hrtimeToMs(process.hrtime(req.timeStart));
            const errorMessage = err.message.msg || err.message;
            const errorCode = !err.statusCode ? 400 : err.statusCode;
            req.log.json({
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
            }, this.EXCEPTION_RESPONSE_POSTFIX);
            next(err);
        };
        return logger;
    }
    canSend() {
        return false;
    }
    static _init(settings) {
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
        }
        else if (settings.streams && settings.streams.length > 0) {
            streamList.push(...settings.streams);
        }
        else {
            streamList.push({
                type: NodeLogger.DEFAULT_STREAM_TYPE,
                level: level,
                stream: new base_stream_1.BaseStream(meta),
            });
        }
        return {
            name: settings.name || NodeLogger.DEFAULT_NAME_AND_TYPE,
            type: settings.type || NodeLogger.DEFAULT_NAME_AND_TYPE,
            streams: streamList,
            serializers: serializerList,
        };
    }
    static _createMeta() {
        const emptyMetaObject = {};
        return {
            get: (key) => emptyMetaObject,
            set: (key, value) => emptyMetaObject,
        };
    }
    static _createStream(settings, meta) {
        if (settings.isTrim) {
            return new trim_stream_1.TrimStream(meta, settings);
        }
        return new mapper_stream_1.MapperStream(meta, settings);
    }
    get _extractSettings() {
        return this._settings;
    }
    _setLogMeta(meta) {
        this._meta.set('log-meta', meta);
    }
}
exports.NodeLogger = NodeLogger;
NodeLogger.INCOMING_REQUEST_POSTFIX = 'INCOMING_REQUEST';
NodeLogger.SUCCESSFUL_RESPONSE_POSTFIX = 'SUCCESSFUL_RESPONSE';
NodeLogger.EXCEPTION_RESPONSE_POSTFIX = 'EXCEPTION_RESPONSE';
NodeLogger.DEFAULT_NAME_AND_TYPE = 'example';
NodeLogger.DEFAULT_STREAM_TYPE = 'raw';
NodeLogger.DEFAULT_LEVEL = 'INFO';
//# sourceMappingURL=index.js.map