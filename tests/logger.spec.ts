import { Logger } from '../index';

const request1 = {
  log: undefined,
  headers: {},
};

const response1 = {
  setHeader: (key, value) => {},
};

const logger = Logger.create({
  name: 'TEST_LOGGER_NAME',
  type: 'TEST_LOGGER_TYPE',
  level: 'INFO',
  isTrim: false,
  isJSON: true,
  isGelf: false,
  isMapper: false,
  gelfConfig: undefined,
  maxMessageLength: 256,
  serializers: undefined,
});

logger.info('PARENT_LOG_1');

logger.middleware(request1, response1, () => {});

request1.log.info('REQUEST_CHILD_LOG_1');

request1.log.setLogMeta({ custom: 'REQUEST_CHILD_META' });

request1.log.info('REQUEST_CHILD_LOG_2');

logger.info('PARENT_LOG_2');
