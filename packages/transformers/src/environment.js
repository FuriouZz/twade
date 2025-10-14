import { mkdirSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";
import { getFiles } from "./utils/file";
import { Asset } from "./asset";
export class Environment {
    options;
    constructor(config) {
        this.options = config;
    }
    joinSourceDir = (asset) => {
        return normalize(join(this.options.srcDir, typeof asset === "string" ? asset : asset.input));
    };
    joinOutputDir = (asset) => {
        const absInput = this.joinSourceDir(asset);
        return normalize(absInput.replace(this.options.srcDir, this.options.dstDir));
    };
    getAssets = (pattern) => {
        const files = getFiles(join(this.options.srcDir, pattern));
        const assets = [];
        for (const absInput of files) {
            if (!absInput)
                continue;
            const input = relative(this.options.srcDir, absInput);
            const asset = new Asset(input, input);
            assets.push(asset);
        }
        return assets;
    };
    ensureDir = (asset) => {
        const dir = this.joinOutputDir(typeof asset === "string" ? asset : dirname(asset.output));
        mkdirSync(join(dir), { recursive: true });
    };
}
