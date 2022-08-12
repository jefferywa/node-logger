"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrimStream = void 0;
const base_stream_1 = require("./base.stream");
const mapper_stream_1 = require("./mapper.stream");
class TrimStream extends mapper_stream_1.MapperStream {
    constructor(meta, options) {
        super(meta, options);
        this.DEFAULT_MAX_MESSAGE_LENGTH = 1024;
        this._meta = meta;
        this._options = Object.assign(Object.assign({}, options), { maxMessageLength: options.maxMessageLength
                ? options.maxMessageLength
                : this.DEFAULT_MAX_MESSAGE_LENGTH });
    }
    _map(record) {
        const _a = super._map(record), { data, message, level, level_number: levelNumber } = _a, rest = __rest(_a, ["data", "message", "level", "level_number"]);
        if (level === base_stream_1.BaseStream.Levels[70]) {
            return Object.assign({ data, level, message }, rest);
        }
        const isLevelE = level === base_stream_1.BaseStream.Levels[50] && data && Object.keys(data).length === 1;
        if (isLevelE) {
            return Object.assign({ data, level, message }, rest);
        }
        return Object.assign({ level: level, level_number: levelNumber, message: message.length > this._options.maxMessageLength
                ? message.slice(0, this._options.maxMessageLength).concat('...')
                : message }, rest);
    }
}
exports.TrimStream = TrimStream;
//# sourceMappingURL=trim.stream.js.map