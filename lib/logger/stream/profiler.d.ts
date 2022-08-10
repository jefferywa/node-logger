export = ProfilerStream;
declare class ProfilerStream extends MapperStream {
    constructor(meta: NodeLogger.Meta.Dto, options: ProfilerStream.Options.Dto);
    _options: ProfilerStream.Options.Dto;
}
import MapperStream = require("./mapper");
