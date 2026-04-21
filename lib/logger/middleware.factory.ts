import { randomUUID } from 'node:crypto';

import { Timer } from '../timer';
import { RecordLikeInterface } from '../interfaces/record-like.interface';
import {
  LoggerErrorInterface,
  LoggerFieldsMetaInterface,
  MiddlewareFactoryLoggerLike,
  MiddlewareRequestInterface,
  MiddlewareResponseInterface,
  NextFunctionInterface,
} from './interfaces/middleware.interface';

function attachRequestLoggerMeta(
  req: MiddlewareRequestInterface,
  meta: RecordLikeInterface,
): void {
  if (req.log?.fields && typeof req.log.fields === 'object') {
    (req.log.fields as LoggerFieldsMetaInterface).__meta = meta;
  }
}

export function createIncomingRequestMiddleware(
  logger: MiddlewareFactoryLoggerLike,
  incomingRequestPostfix: string,
) {
  return (
    req: MiddlewareRequestInterface,
    res: MiddlewareResponseInterface,
    next: NextFunctionInterface,
  ): void => {
    let requestId = req.headers['x-request-id'];
    if (!requestId) {
      requestId = randomUUID();
    }
    if (Array.isArray(requestId)) {
      requestId = requestId[0];
    }

    res.setHeader('x-request-id', requestId);

    const meta = { requestId: requestId as string };
    req.requestId = requestId;
    req.log = logger.createChild(meta);
    attachRequestLoggerMeta(req, meta);
    req.log.json({ req }, incomingRequestPostfix);
    next();
  };
}

export function createSuccessfulShortResponseMiddleware(
  successfulResponsePostfix: string,
) {
  return (
    req: MiddlewareRequestInterface,
    _res: MiddlewareResponseInterface,
    next: NextFunctionInterface,
  ): void => {
    if (!req.requestId || !req.timeStart) {
      return next();
    }

    const time = Timer.hrtimeToMs(process.hrtime(req.timeStart));

    req.log?.json(
      { secureJsonData: { code: 200, meta: { time } } },
      successfulResponsePostfix,
    );

    next();
  };
}

export function createSuccessfulResponseMiddleware(
  successfulResponsePostfix: string,
) {
  return (
    req: MiddlewareRequestInterface,
    res: MiddlewareResponseInterface,
    next: NextFunctionInterface,
  ): void => {
    if (!req.requestId || !req.timeStart) {
      return next();
    }

    const time = Timer.hrtimeToMs(process.hrtime(req.timeStart));
    if (!res.result && res.result !== null) {
      return next();
    }

    if (
      typeof res.result === 'object' &&
      res.result !== null &&
      'stream' in res.result
    ) {
      return next();
    }

    req.log?.json(
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
      successfulResponsePostfix,
    );

    next();
  };
}

export function createExceptionResponseMiddleware(
  exceptionResponsePostfix: string,
) {
  return (
    err: LoggerErrorInterface,
    req: MiddlewareRequestInterface,
    _res: MiddlewareResponseInterface,
    next: NextFunctionInterface,
  ): void => {
    if (!req.requestId || !req.timeStart) {
      return next();
    }

    const time = Timer.hrtimeToMs(process.hrtime(req.timeStart));
    const errorMessage =
      typeof err.message === 'string' ? err.message : 'Unknown error';
    const errorCode = !err.statusCode ? 400 : err.statusCode;

    req.log?.json(
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
      exceptionResponsePostfix,
    );

    next(err);
  };
}
