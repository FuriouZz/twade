import type { AssetConfig } from "./types";
export declare class Asset {
    input: string;
    output: string;
    constructor(input: string, output: string);
    wrap(cb: Promise<unknown> | (() => Promise<unknown>)): Promise<void>;
    static process(config: AssetConfig): Promise<void>;
}
export declare function defineAssetConfig(userOptions?: Partial<AssetConfig>): AssetConfig;
