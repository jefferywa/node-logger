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
exports.BaseStream = void 0;
class BaseStream {
    constructor(meta) {
        this._meta = meta;
    }
    static get Levels() {
        return {
            70: 'Z',
            60: 'C',
            50: 'E',
            40: 'W',
            30: 'I',
            20: 'D',
            10: 'T',
        };
    }
    _map(record) {
        const { msg, level, __meta } = record, rest = __rest(record, ["msg", "level", "__meta"]);
        return Object.assign(Object.assign(Object.assign(Object.assign({ '@timestamp': new Date() }, rest), { level: BaseStream.Levels[level], msg, level_number: level }), __meta), this._meta.get('log-meta'));
    }
    write(record) {
        process.stdout.write(`${JSON.stringify(this._map(record))}\n`);
    }
}
exports.BaseStream = BaseStream;
//# sourceMappingURL=base.stream.js.map