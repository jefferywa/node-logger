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
exports.MapperStream = void 0;
const fs_1 = require("fs");
const base_stream_1 = require("./base.stream");
class MapperStream {
    constructor(meta, options) {
        this.DEFAULT_WRITE_MODE = 'STDOUT';
        this._meta = meta;
        this._options = options;
    }
    _map(record) {
        const { msg, hostname, type, zone, name, time, level, __meta } = record, rest = __rest(record, ["msg", "hostname", "type", "zone", "name", "time", "level", "__meta"]);
        let data;
        if (Object.keys(rest).length) {
            data = rest;
        }
        return Object.assign(Object.assign({ '@timestamp': time, source_host: hostname, name,
            type,
            zone, level: base_stream_1.BaseStream.Levels[level], level_number: level, message: msg, data }, __meta), this._meta.get('log-meta'));
    }
    write(record) {
        if (this._options.mode && this._options.mode !== this.DEFAULT_WRITE_MODE) {
            const writeStream = fs_1.default.createWriteStream(`${this._options.path}/${process.pid}.log`, {
                flags: 'a',
            });
            writeStream.write(`${JSON.stringify(this._map(record))}\n`);
        }
        else {
            process.stdout.write(`${JSON.stringify(this._map(record))}\n`);
        }
    }
}
exports.MapperStream = MapperStream;
//# sourceMappingURL=mapper.stream.js.map