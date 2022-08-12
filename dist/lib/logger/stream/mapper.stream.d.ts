import { Meta } from '../../interfaces/meta.interface';
import { Settings } from '../../interfaces/settings.interface';
export declare class MapperStream {
    private readonly DEFAULT_WRITE_MODE;
    protected readonly _meta: Meta;
    protected readonly _options: Settings;
    constructor(meta: Meta, options: Settings);
    protected _map(record: any): any;
    write(record: any): void;
}
