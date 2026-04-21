# README #
Simple runtime logging library based on [bunyan](https://www.npmjs.com/package/bunyan)

[![npm](https://img.shields.io/npm/v/@jefferywa/node-logger)](https://www.npmjs.com/package/@jefferywa/node-logger)
[![GitHub](https://img.shields.io/badge/github-code-brightgreen)](https://github.com/jefferywa/node-logger)
[![Issues](https://img.shields.io/badge/github-issues-red)](https://github.com/jefferywa/node-logger/issues)

[![NPM](https://nodei.co/npm/@jefferywa/node-logger.png?downloads=true&compact=true)](https://nodei.co/npm/%40jefferywa%2Fnode-logger?)

## Quick Start
The recommended use of `NodeLogger` is to create a singleton logger instance when the server application is initialized. 
The easiest way to do this is to use the static `Logger.create` method, passing the `settings` object into it.

```typescript
// TypeScript
import { Logger } from '@jefferywa/node-logger';
// or JavaScript
const { Logger } = require('@jefferywa/node-logger');

const logger = Logger.create({}); // Your logger instance
```

## Logging

### Logging levels
The values for the levels are taken from the Bunyan library and extended with a `Z` value (for JSON logging)

```typescript
const levels = {
  70: 'Z', // JSON
  50: 'E', // ERROR
  40: 'W', // WARNING
  30: 'I', // INFO
  20: 'D', // DEBUG
  10: 'T', // TRACE
};
```

### Creating your Logger instance
You get started by creating a logger using Logger.create:

```typescript
const logger = Logger.create({
  name: 'EXAMPLE_PROJECT_NAME', // - Write your project name
  type: 'backend', // - Write your project type, for example `backend` or `api` 
  level: 'INFO', // - Write default logger level, in default settings it is INFO
  serializers: {
    // Your serializers
    err: function (err: any): any {
      return {
        message: JSON.stringify(err.message),
        name: err.name,
        stack: err.stack,
      };
    },
    stringData: (data: any[] | object): string => {
      return JSON.stringify(data);
    },
    secureStringData: (data: any[] | object): string => {
      const dataStr = JSON.stringify(data);
      return maskString(dataStr); // You can use functions to hide values
    },
    ...
  },
  maxMessageLength: 256, // - Write maximum log row length, this setting worked with field `isTrim`
  isTrim: true, // - If set to `true`, will enable the `Trim` mode using the `maxMessageLength` parameter, this setting working with setting 'isMapper=true' 
  isMapper: false, // If set to `true`, Mapper mode will be enabled, for a more detailed listing of the value in the entry log line
  isJSON: true, //  If set to `true`, `logger.json` method support will be enabled, by default `false`
  isGelf: false, // If set to `true`, logs will be sent to graylog via gelf, this setting working with setting 'isMapper=true' 
  gelfConfig: {
    graylogPort: 12201,
    graylogHostname: '127.0.0.1',
    connection: 'wan',
    maxChunkSizeWan: 1420,
    maxChunkSizeLan: 8154
  }
});
```

### Serializers
Configuration object containing functions that you can use in logging mods such as info and error

```typescript
import { Logger } from '@jefferywa/node-logger';

// Same functions the library uses when you rely on built-in defaults
const serializers = {
  header: Logger.Serializers.header,
  req: Logger.Serializers.req,
  err: Logger.Serializers.err,
};
```

You can merge or override these in the `settings.serializers` object when calling `Logger.create`, as shown above.

### Logger methods

```typescript
logger.info('Your info log string'); // For logging string value
// {"@timestamp":"2022-08-12T15:15:30.999Z","name":"EXAMPLE_PROJECT_NAME","type":"backend","hostname":"notebook.local","pid":18585,"time":"2022-08-12T15:15:30.999Z","v":0,"level":"I","msg":"Your info log string","level_number":30}

logger.json({stringData: {data: {message: 'your data'}}}, 'Your log string'); // For logging json values
// {"@timestamp":"2022-08-12T15:15:30.999Z","name":"example","type":"example","hostname":"notebook.local","pid":18585,"stringData":"{\"data\":{\"message\":\"your data\"}}","time":"2022-08-12T15:15:30.999Z","v":0,"level":"Z","msg":"Your log string","level_number":70}

logger.error({err: {name: 'Error', message: 'Error message', stack: "Error: Error message stack trace" }}, 'Your error log string'); // For logging errors
// {"@timestamp":"2022-08-14T17:01:24.499Z","name":"example","type":"example","hostname":"notebook.local","pid":18585,"err":{"message":"\"Error message\"","name":"Error","stack":"Error: Error message stack trace"},"time":"2022-08-14T17:01:24.498Z","v":0,"level":"E","msg":"Your error log string","level_number":50}

logger.warn('Your warning log string'); // For logging warnings
// {"@timestamp":"2022-08-14T17:04:16.330Z","name":"example","type":"example","hostname":"notebook.local","pid":18585,"time":"2022-08-14T17:04:16.330Z","v":0,"level":"W","msg":"Your warning log string","level_number":40}

// etc. As well as all the methods supported by bunyan
```

## Installation

Requires **Node.js 20+** (see `engines` in `package.json`).

```bash
npm install @jefferywa/node-logger
```

```bash
yarn add @jefferywa/node-logger
```

### Runtime dependencies (consumer footprint)

The package adds only **two** runtime dependencies to your app: [`bunyan`](https://www.npmjs.com/package/bunyan) and [`gelf`](https://www.npmjs.com/package/gelf). Identifiers such as `processId` and request IDs use **`node:crypto`** (`randomUUID`), not a separate `uuid` package.

Optional: [`@nestjs/common`](https://www.npmjs.com/package/@nestjs/common) is an **optional peer** — install it only if you import `@jefferywa/node-logger/nest`.

### TypeScript

Published typings live under `dist/types` and are referenced from the `exports` map, so you get types for `Logger`, settings, and the `./nest` entry without extra setup.

Install [`@types/bunyan`](https://www.npmjs.com/package/@types/bunyan) only if you type **raw Bunyan APIs** or third-party code that expects DefinitelyTyped’s `bunyan` shapes beyond this library’s surface.

#### Author: [JefferyWa (Vsevolod Golubinov)](https://github.com/jefferywa)

## NestJS compatibility

The package keeps the original API and also provides optional NestJS adapters.

```typescript
import {
  NODE_LOGGER,
  NODE_LOGGER_SETTINGS,
  NEST_LOGGER_SERVICE,
  NestLoggerService,
  NodeLoggerModule,
  type NodeLoggerModuleAsyncOptions,
} from '@jefferywa/node-logger/nest';
```

`@nestjs/common` is an optional peer dependency and is only required when you use the `@jefferywa/node-logger/nest` entrypoint.

## Development

- Runtime target: Node.js 20+ (see `.nvmrc` for a concrete version hint)
- TypeScript toolchain: TypeScript 6
- Changes are summarized in [CHANGELOG.md](CHANGELOG.md)
- On GitHub, **CI** runs `npm run quality` on pushes and pull requests to `master` / `main`

Useful commands:

```bash
npm run quality
npm run build
npm run check:circular
npm run check:circular:verbose
npm run test:comparative
```

Comparative tests (`tests/comparative.spec.ts`) validate current output against fixed baseline fixtures from the legacy behavior.

## Git hooks

Project uses `husky` and includes:

- `.husky/pre-commit` -> runs `npm run eslint:fix`, `npm run prettier:fix`, `git add .`
- `.husky/pre-push` -> runs `npm install`, then `npm run quality` (lint, typecheck, circular dependency check, tests, build)
- `.husky/post-commit` -> runs `git update-index --again`

This blocks push when lint, types, circular dependencies, tests, or build fail.