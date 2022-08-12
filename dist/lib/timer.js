"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
class Timer {
    static hrtimeToMs(hr) {
        return Math.ceil(hr[0] * 1e3 + hr[1] / 1e6);
    }
}
exports.Timer = Timer;
//# sourceMappingURL=timer.js.map