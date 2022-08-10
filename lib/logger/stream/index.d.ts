export = Stream;
declare class Stream {
    private static get Levels();
    constructor(meta: NodeLogger.Meta.Dto);
    _meta: NodeLogger.Meta.Dto;
    _map(rec: any): any;
    write(rec: any): void;
}
