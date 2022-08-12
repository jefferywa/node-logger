import * as Bunyan from 'bunyan';
import { LoggerOptions } from 'bunyan';
import { Settings } from '../interfaces/settings.interface';
export declare class NodeLogger extends Bunyan {
    protected static readonly INCOMING_REQUEST_POSTFIX = "INCOMING_REQUEST";
    protected static readonly SUCCESSFUL_RESPONSE_POSTFIX = "SUCCESSFUL_RESPONSE";
    protected static readonly EXCEPTION_RESPONSE_POSTFIX = "EXCEPTION_RESPONSE";
    protected static readonly DEFAULT_NAME_AND_TYPE = "example";
    protected static readonly DEFAULT_STREAM_TYPE = "raw";
    protected static readonly DEFAULT_LEVEL = "INFO";
    private readonly _meta;
    private readonly _settings;
    middleware: (req: any, res: any, next: any) => void;
    middlewareSuccessfulShortResponse: (req: any, res: any, next: any) => void;
    middlewareSuccessfulResponse: (req: any, res: any, next: any) => void;
    private middlewareExceptionResponse;
    constructor(settings: Settings);
    static get Serializers(): {
        header: (headers: any) => any;
        req: (request: any) => {
            url: any;
            method: any;
            headers: any;
        };
        err: (err: any) => {
            name: any;
            message: string;
            stack: any;
        };
    };
    json(args: any, ...rest: any): void;
    log(arg: any, ...rest: any): void;
    static create(settings: any): NodeLogger;
    canSend(): boolean;
    static _init(settings: Settings): LoggerOptions;
    private static _createMeta;
    private static _createStream;
    private get _extractSettings();
    private _setLogMeta;
}
