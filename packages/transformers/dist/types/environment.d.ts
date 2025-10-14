import type { AssetConfig } from "./types";
import { Asset } from "./asset";
export declare class Environment {
    options: AssetConfig;
    constructor(config: AssetConfig);
    joinSourceDir: (asset: string | Asset) => string;
    joinOutputDir: (asset: string | Asset) => string;
    getAssets: (pattern: string) => Asset[];
    ensureDir: (asset: string | Asset) => void;
}
