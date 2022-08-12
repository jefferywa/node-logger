"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const logger = index_1.Logger.create({});
logger.info('INFO_STRING');
logger.error({ err: { message: 'test', name: 'error_name' } }, 'ERROR_STRING');
//# sourceMappingURL=test.js.map