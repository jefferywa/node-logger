import { Logger } from './../index';

const logger = Logger.create({
  name: 'TEST_LOGGER',
  type: 'backend',
  level: 'info',
  isTrim: false,
  isJSON: true,
  isGelf: true,
  isMapper: true,
  gelfConfig: {
    graylogPort: 12201,
    graylogHostname: 'localhost',
    connection: 'wan',
    maxChunkSizeWan: 1420,
    maxChunkSizeLan: 8154,
  },
  maxMessageLength: 256,
  serializers: {},
});

const childLogger = logger.createChild({ sessionId: 111 });

const req = {
  log: null,
  headers: {},
};

const res = {
  headers: {},
  setHeader(header) {
    this.headers['x-request-id'] = header;
  },
};

logger.middleware(req, res, () => 1);

req.log.info('TEST_R');
logger.info('TEST_M');
logger.json({ stringData: { test: 1 } }, 'TEST_M_J');
childLogger.info('TEST_C');

req.log.json({ stringData: { test: 1 } }, 'TEST_R_J');
