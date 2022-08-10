export = TrimStream;
declare class TrimStream extends MapperStream {
    constructor(meta: NodeLogger.Meta.Dto, maxMessageLength: number);
    _maxMessageLength: number;
    _map(rec: any): any;
}
import MapperStream = require("./mapper");
