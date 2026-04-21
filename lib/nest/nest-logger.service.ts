import type { LoggerService } from '@nestjs/common';

import { NodeLogger } from '../logger';

export class NestLoggerService implements LoggerService {
  constructor(private readonly logger: NodeLogger) {}

  get rawLogger(): NodeLogger {
    return this.logger;
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.info(message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    // Bunyan doesn't have a dedicated verbose level, map to debug.
    this.logger.debug(message, ...optionalParams);
  }

  setLogMeta(meta: Record<string, unknown>): void {
    this.logger.setLogMeta(meta);
  }
}
