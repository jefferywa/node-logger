import { Logger } from '../../index';
import { OutputRecordInterface } from '../interfaces/output-record.interface';

const settings = {
  name: 'TEST_LOGGER_NAME',
  type: 'TEST_LOGGER_TYPE',
  level: 'INFO',
  isTrim: false,
  isJSON: true,
  isGelf: false,
  isMapper: false,
  maxMessageLength: 256,
};

function parseOutput(lines: string[]): OutputRecordInterface[] {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as OutputRecordInterface)
    .map((row) => {
      const rest = { ...row };
      delete rest['@timestamp'];
      delete rest.time;
      delete rest.pid;
      delete rest.hostname;
      delete rest.processId;
      delete rest._events;
      delete rest._eventsCount;
      delete rest._level;
      delete rest._settings;
      delete rest._meta;
      delete rest.fields;
      delete rest.v;
      delete rest.haveNonRawStreams;
      if (typeof rest.req === 'object' && rest.req !== null) {
        const req = { ...(rest.req as Record<string, unknown>) };
        delete req.url;
        delete req.method;
        rest.req = req;
      }
      return rest;
    });
}

export function runBaselineScenario(
  writeSpyFactory: (writer: (chunk: string | Uint8Array) => void) => () => void,
): OutputRecordInterface[] {
  const logger = Logger.create(settings);
  const lines: string[] = [];

  const restore = writeSpyFactory((chunk: string | Uint8Array) => {
    lines.push(String(chunk));
  });

  try {
    logger.info('PARENT_LOG_1');
    const req: {
      headers: Record<string, string>;
      log?: typeof logger;
      requestId?: string;
    } = {
      headers: {
        'x-request-id': 'req-1',
      },
    };
    const res = {
      setHeader: () => undefined,
    };

    logger.middleware(req, res, () => undefined);
    req.log?.setLogMeta({ custom: 'REQUEST_CHILD_META' });
    req.log?.info('REQUEST_CHILD_LOG_2');
    logger.info('PARENT_LOG_2');
  } finally {
    restore();
  }

  return parseOutput(lines);
}

export function runSuccessfulResponseScenario(
  writeSpyFactory: (writer: (chunk: string | Uint8Array) => void) => () => void,
): OutputRecordInterface[] {
  const logger = Logger.create(settings);
  const lines: string[] = [];

  const restore = writeSpyFactory((chunk: string | Uint8Array) => {
    lines.push(String(chunk));
  });

  try {
    const req: {
      headers: Record<string, string>;
      log?: typeof logger;
      requestId?: string;
      timeStart?: [number, number];
    } = {
      headers: {
        'x-request-id': 'req-success',
      },
    };
    const res: {
      setHeader: () => void;
      result?: unknown;
    } = {
      setHeader: () => undefined,
      result: { ok: true },
    };

    logger.middleware(req, res, () => undefined);
    req.timeStart = [0, 0];
    logger.middlewareSuccessfulResponse(req, res, () => undefined);
  } finally {
    restore();
  }

  return parseOutput(lines);
}

export function runExceptionResponseScenario(
  writeSpyFactory: (writer: (chunk: string | Uint8Array) => void) => () => void,
): OutputRecordInterface[] {
  const logger = Logger.create(settings);
  const lines: string[] = [];

  const restore = writeSpyFactory((chunk: string | Uint8Array) => {
    lines.push(String(chunk));
  });

  try {
    const req: {
      headers: Record<string, string>;
      log?: typeof logger;
      requestId?: string;
      timeStart?: [number, number];
    } = {
      headers: {
        'x-request-id': 'req-error',
      },
    };
    const res = {
      setHeader: () => undefined,
    };
    const error = {
      name: 'ValidationError',
      message: 'validation failed',
      statusCode: 422,
    };

    logger.middleware(req, res, () => undefined);
    req.timeStart = [0, 0];
    logger.middlewareExceptionResponse(error, req, res, () => undefined);
  } finally {
    restore();
  }

  return parseOutput(lines);
}

export function runSuccessfulShortResponseScenario(
  writeSpyFactory: (writer: (chunk: string | Uint8Array) => void) => () => void,
): OutputRecordInterface[] {
  const logger = Logger.create(settings);
  const lines: string[] = [];

  const restore = writeSpyFactory((chunk: string | Uint8Array) => {
    lines.push(String(chunk));
  });

  try {
    const req: {
      headers: Record<string, string>;
      log?: typeof logger;
      requestId?: string;
      timeStart?: [number, number];
    } = {
      headers: {
        'x-request-id': 'req-short',
      },
    };
    const res = {
      setHeader: () => undefined,
    };

    logger.middleware(req, res, () => undefined);
    req.timeStart = [0, 0];
    logger.middlewareSuccessfulShortResponse(req, res, () => undefined);
  } finally {
    restore();
  }

  return parseOutput(lines);
}
