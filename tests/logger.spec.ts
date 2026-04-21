import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '../index';
import { NestLoggerService } from '../nest';
import { OutputRecordInterface } from './interfaces/output-record.interface';

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

function captureStdout(action: () => void): string[] {
  const lines: string[] = [];
  const writeMock = vi
    .spyOn(process.stdout, 'write')
    .mockImplementation((chunk: string | Uint8Array) => {
      lines.push(String(chunk));
      return true;
    });

  try {
    action();
  } finally {
    writeMock.mockRestore();
  }

  return lines;
}

describe('NodeLogger contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps middleware request contract with req.log and request id', () => {
    const logger = Logger.create(settings);
    const setHeader = vi.fn();

    const req: {
      headers: Record<string, string>;
      log?: typeof logger;
      requestId?: string;
    } = {
      headers: {
        'x-request-id': 'req-fixed-id',
      },
    };
    const res = { setHeader };

    logger.middleware(req, res, () => undefined);

    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'req-fixed-id');
    expect(req.requestId).toBe('req-fixed-id');
    expect(req.log).toBeDefined();
    expect(
      (
        req.log?.fields as Record<string, unknown> & {
          __meta?: Record<string, unknown>;
        }
      )?.__meta?.requestId,
    ).toBe('req-fixed-id');
    expect(typeof req.log?.setLogMeta).toBe('function');
    expect(typeof req.log?.json).toBe('function');
  });

  it('keeps json method behavior for string and object payloads', () => {
    const logger = Logger.create(settings);
    const infoSpy = vi.spyOn(logger, 'info');

    logger.json('TEXT_EVENT');
    logger.json({ stringData: { a: 1 } }, 'JSON_EVENT');

    expect(infoSpy).toHaveBeenNthCalledWith(1, { level: 70 }, 'TEXT_EVENT');
    expect(infoSpy).toHaveBeenNthCalledWith(
      2,
      { stringData: { a: 1 }, level: 70 },
      'JSON_EVENT',
    );
  });

  it('keeps stable normalized output for baseline scenario', () => {
    const logger = Logger.create(settings);

    const lines = captureStdout(() => {
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
    });

    const normalized = parseOutput(lines);

    expect(normalized).toEqual([
      {
        name: 'TEST_LOGGER_NAME',
        type: 'TEST_LOGGER_TYPE',
        level: 'I',
        msg: 'PARENT_LOG_1',
        level_number: 30,
      },
      {
        req: {
          headers: {
            'x-request-id': 'req-1',
          },
        },
        name: 'TEST_LOGGER_NAME',
        type: 'TEST_LOGGER_TYPE',
        level: 'Z',
        msg: 'INCOMING_REQUEST',
        level_number: 70,
        requestId: 'req-1',
      },
      {
        name: 'TEST_LOGGER_NAME',
        type: 'TEST_LOGGER_TYPE',
        level: 'I',
        msg: 'REQUEST_CHILD_LOG_2',
        level_number: 30,
        requestId: 'req-1',
        custom: 'REQUEST_CHILD_META',
      },
      {
        name: 'TEST_LOGGER_NAME',
        type: 'TEST_LOGGER_TYPE',
        level: 'I',
        msg: 'PARENT_LOG_2',
        level_number: 30,
      },
    ]);
  });
});

describe('Nest compatibility contract', () => {
  it('keeps instanceof Logger contract for request child logger', () => {
    const logger = Logger.create(settings);
    const req: {
      headers: Record<string, string>;
      log?: typeof logger;
    } = {
      headers: {
        'x-request-id': 'req-instanceof',
      },
    };
    const res = {
      setHeader: () => undefined,
    };

    logger.middleware(req, res, () => undefined);

    expect(req.log instanceof Logger).toBe(true);
  });

  it('supports REQUEST_LOGGER fallback to singleton logger', () => {
    const singletonLogger = Logger.create(settings);
    const requestWithoutLog: { log?: typeof singletonLogger } = {};

    const resolvedLogger = requestWithoutLog.log || singletonLogger;
    const infoSpy = vi.spyOn(singletonLogger, 'info');

    resolvedLogger.info('FALLBACK_WORKS');

    expect(infoSpy).toHaveBeenCalledWith('FALLBACK_WORKS');
  });

  it('maps nest logger interface methods without breaking NodeLogger API', () => {
    const logger = Logger.create(settings);
    const service = new NestLoggerService(logger);
    const debugSpy = vi.spyOn(logger, 'debug');
    const warnSpy = vi.spyOn(logger, 'warn');

    service.verbose('verbose-message');
    service.warn('warn-message');

    expect(debugSpy).toHaveBeenCalledWith('verbose-message');
    expect(warnSpy).toHaveBeenCalledWith('warn-message');
    expect(service.rawLogger).toBe(logger);
  });

  it('accepts serializers typed as object (consumer config DTO compat)', () => {
    const dto = {
      name: 'DTO_NAME',
      type: 'DTO_TYPE',
      level: 'INFO',
      isTrim: false,
      isJSON: true,
      isGelf: false,
      isMapper: false,
      serializers: {} as object,
    };
    expect(() => Logger.create(dto)).not.toThrow();
  });

  it('exposes log-meta for optional chaining (e.g. requestId)', () => {
    const logger = Logger.create(settings);
    logger.setLogMeta({ requestId: 'req-from-test' });
    expect(logger.meta['log-meta']?.requestId).toBe('req-from-test');
  });
});
