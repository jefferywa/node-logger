import { Meta } from '../../interfaces/meta.interface';
export declare class BaseStream {
    private readonly _meta;
    constructor(meta: Meta);
    static get Levels(): Record<number, string>;
    protected _map(record: any): any;
    write(record: any): void;
}
