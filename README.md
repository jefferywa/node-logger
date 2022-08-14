# README #
Simple runtime logging library based on [bunyan](https://www.npmjs.com/package/bunyan)

[![Version npm](https://img.shields.io/badge/npm-v2.0.0-blue)](https://www.npmjs.com/package/@jefferywa/node-logger)
[![Version git](https://img.shields.io/badge/github-code-brighthgreen)](https://github.com/jefferywa/node-logger)

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
const logger = winston.createLogger({
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
  isTrim: true, // - If set to `true`, will enable the `Trim` mode using the `maxMessageLength` parameter
  isMapper: false, // If set to `true`, Mapper mode will be enabled, for a more detailed listing of the value in the entry log line
  isJSON: true, //  If set to `true`, `logger.json` method support will be enabled, by default `false`
});
```

### Serializers
Configuration object containing functions that you can use in logging mods such as info and error

```typescript
// Default serializers
const serializers = {
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
```
You can also extend the set of these functions through the settings object, as shown above in the creation of a logger instance

### Logger methods

```typescript
logger.info('Your info log string'); // For logging string value
// {"@timestamp":"2022-08-12T15:15:30.999Z","name":"EXAMPLE_PROJECT_NAME","type":"backend","hostname":"notebook.local","pid":18585,"time":"2022-08-12T15:15:30.999Z","v":0,"level":"I","msg":"Your info log string","level_number":30}

logger.json({stringData: {data: {message: 'your data'}}}, 'Your log string'); // For logging json values
// {"@timestamp":"2022-08-12T15:15:30.999Z","name":"example","type":"example","hostname":"notebook.local","pid":18585,"stringData":"{\"data\":{\"message\":\"your data\"}}","time":"2022-08-12T15:15:30.999Z","v":0,"level":"Z","msg":"Your log string","level_number":70}

logger.error({err: {name: 'Error', message: 'Error message', stack: "Error: Error message stack trace" }}, 'Your error log string'); // For loggin errors
// {"@timestamp":"2022-08-14T17:01:24.499Z","name":"example","type":"example","hostname":"notebook.local","pid":18585,"err":{"message":"\"Error message\"","name":"Error","stack":"Error: Error message stack trace"},"time":"2022-08-14T17:01:24.498Z","v":0,"level":"E","msg":"Your error log string","level_number":50}

logger.warn('Your warning log string'); // For logging warnings
// {"@timestamp":"2022-08-14T17:04:16.330Z","name":"example","type":"example","hostname":"notebook.local","pid":18585,"time":"2022-08-14T17:04:16.330Z","v":0,"level":"W","msg":"Your warning log string","level_number":40}

// etc. As well as all the methods supported by bunyan
```

## Installation

``` bash
npm install @jefferywa/node-logger
```

``` bash
yarn add @jefferywa/node-logger
```

#### Author: [JefferyWa (Vsevolod Golubinov)](https://github.com/jefferywa)