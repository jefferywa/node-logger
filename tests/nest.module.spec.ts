import { describe, expect, it } from 'vitest';

import {
  NEST_LOGGER_SERVICE,
  NODE_LOGGER,
  NODE_LOGGER_SETTINGS,
  NodeLoggerModule,
} from '../nest';

describe('NodeLoggerModule', () => {
  it('creates sync dynamic module with expected providers', () => {
    const moduleDefinition = NodeLoggerModule.forRoot({
      name: 'test',
      type: 'backend',
      level: 'INFO',
      isTrim: false,
      isJSON: true,
      isGelf: false,
      isMapper: false,
    });

    expect(moduleDefinition.module).toBe(NodeLoggerModule);
    expect(moduleDefinition.exports).toContain(NODE_LOGGER_SETTINGS);
    expect(moduleDefinition.exports).toContain(NODE_LOGGER);
    expect(moduleDefinition.exports).toContain(NEST_LOGGER_SERVICE);
  });

  it('creates async dynamic module with provided imports and inject list', () => {
    const moduleDefinition = NodeLoggerModule.forRootAsync({
      imports: [],
      inject: ['CONFIG_TOKEN'],
      useFactory: () => ({
        name: 'test',
        type: 'backend',
        level: 'INFO',
        isTrim: false,
        isJSON: true,
        isGelf: false,
        isMapper: false,
      }),
    });

    expect(moduleDefinition.module).toBe(NodeLoggerModule);
    expect(moduleDefinition.providers).toBeDefined();
    expect(moduleDefinition.exports).toContain(NODE_LOGGER_SETTINGS);
  });
});
