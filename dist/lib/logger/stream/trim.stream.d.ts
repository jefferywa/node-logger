import { Meta } from '../../interfaces/meta.interface';
import { Settings } from '../../interfaces/settings.interface';
import { MapperStream } from './mapper.stream';
export declare class TrimStream extends MapperStream {
    private readonly DEFAULT_MAX_MESSAGE_LENGTH;
    protected readonly _meta: Meta;
    protected readonly _options: Settings;
    constructor(meta: Meta, options: Settings);
    protected _map(record: any): any;
}
