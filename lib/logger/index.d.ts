export = NodeLogger;
declare class NodeLogger {
    static get Serializers(): import(".").NodeLogger.Serializers.Dto;
    static create(settings: NodeLogger.Settings.Dto): NodeLogger;
    private static _init;
    private static _extractMeta;
    private static _createStream;
    constructor(settings: NodeLogger.Settings.Dto | NodeLogger, options?: NodeLogger.Options.Dto);
    _options: NodeLogger.Options.Dto;
    _settings: any;
    _meta: import(".").NodeLogger.Meta.Dto;
    private get _extractSettings();
    json(arg: string | number | any, ...rest: string): void;
    log(arg: string | number | any, ...rest: string): void;
    canSend(): boolean;
    _setLogMeta(meta: NodeLogger.Meta.Dto): void;
}
