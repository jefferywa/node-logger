export = MapperStream;
declare class MapperStream {
    constructor(meta: NodeLogger.Meta.Dto, mode?: string, path?: string);
    _meta: NodeLogger.Meta.Dto;
    _mode: string;
    _path: string;
    _map(rec: any): any;
    write(rec: any): void;
}
