import {
  DynamicModule,
  Module,
  Provider,
  type ModuleMetadata,
} from '@nestjs/common';

import { LoggerSettings } from '../interfaces/logger.interface';
import { NodeLogger } from '../logger';
import { NestLoggerService } from './nest-logger.service';

export const NODE_LOGGER_SETTINGS = 'NODE_LOGGER_SETTINGS';
export const NODE_LOGGER = 'NODE_LOGGER';
export const NEST_LOGGER_SERVICE = 'NEST_LOGGER_SERVICE';

export interface NodeLoggerModuleAsyncOptions {
  imports?: NonNullable<ModuleMetadata['imports']>;
  inject?: readonly string[];
  useFactory: (...args: unknown[]) => Promise<LoggerSettings> | LoggerSettings;
}

@Module({})
export class NodeLoggerModule {
  static forRoot(settings: LoggerSettings): DynamicModule {
    const settingsProvider: Provider = {
      provide: NODE_LOGGER_SETTINGS,
      useValue: settings,
    };

    return {
      module: NodeLoggerModule,
      providers: [
        settingsProvider,
        {
          provide: NODE_LOGGER,
          useFactory: (loggerSettings: LoggerSettings) =>
            NodeLogger.create(loggerSettings),
          inject: [NODE_LOGGER_SETTINGS],
        },
        {
          provide: NEST_LOGGER_SERVICE,
          useFactory: (logger: NodeLogger) => new NestLoggerService(logger),
          inject: [NODE_LOGGER],
        },
      ],
      exports: [NODE_LOGGER_SETTINGS, NODE_LOGGER, NEST_LOGGER_SERVICE],
    };
  }

  static forRootAsync(options: NodeLoggerModuleAsyncOptions): DynamicModule {
    const settingsProvider: Provider = {
      provide: NODE_LOGGER_SETTINGS,
      useFactory: options.useFactory,
      inject: options.inject ? [...options.inject] : [],
    };

    return {
      module: NodeLoggerModule,
      imports: options.imports ? [...options.imports] : [],
      providers: [
        settingsProvider,
        {
          provide: NODE_LOGGER,
          useFactory: (loggerSettings: LoggerSettings) =>
            NodeLogger.create(loggerSettings),
          inject: [NODE_LOGGER_SETTINGS],
        },
        {
          provide: NEST_LOGGER_SERVICE,
          useFactory: (logger: NodeLogger) => new NestLoggerService(logger),
          inject: [NODE_LOGGER],
        },
      ],
      exports: [NODE_LOGGER_SETTINGS, NODE_LOGGER, NEST_LOGGER_SERVICE],
    };
  }
}
