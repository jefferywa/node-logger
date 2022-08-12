"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const mask = (str) => {
    const result = str.replace(/("password":|"pass":|"token":|"Service-Token":).+?("|,)/, '$1"****"');
    return result.replace(/("\d{3,4}")/g, '"***"');
};
const logger = index_1.Logger.create({
    name: 'TEST',
    type: 'backend',
    level: 'INFO',
    serializers: {
        err: function (err) {
            return {
                message: JSON.stringify(err.message),
                name: err.name,
                stack: err.stack,
            };
        },
        secureError: function ({ err, params, from }) {
            const messageStr = JSON.stringify(err.message);
            const paramsStr = JSON.stringify(params);
            return {
                error: {
                    message: mask(messageStr),
                    name: JSON.stringify(err.name),
                    stack: JSON.stringify(err.stack),
                },
                from: JSON.stringify(from),
                params: mask(paramsStr),
            };
        },
        stringData: (data) => {
            return JSON.stringify(data);
        },
        secureStringData: (data) => {
            const dataStr = JSON.stringify(data);
            return mask(dataStr);
        },
        jsonData: (data) => {
            return data;
        },
        secureJsonData: (data) => {
            const dataStr = JSON.stringify(data);
            const maskedData = mask(dataStr);
            return JSON.parse(maskedData);
        },
    },
    maxMessageLength: 256,
    isTrim: true,
    isMapper: false,
    isJSON: true,
});
logger.info('STRING');
logger.json({ stringData: { a: 1 } }, 'STRING_JSON');
logger.error({ err: { name: 'error', message: 'asss' } }, 'STRING_ERROR');
logger.warn('STRING_WARN');
//# sourceMappingURL=test.js.map