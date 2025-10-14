import { isAbsolute, join } from "node:path";
import { cwd, env, loadEnvFile } from "node:process";
import { Environment } from "./environment";
export class Asset {
    input;
    output;
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    async wrap(cb) {
        console.log("process:", this.input);
        const promise = typeof cb === "function" ? cb() : cb;
        await promise.then(() => {
            console.log("created:", this.output);
        }, (e) => {
            console.log("failed to create:", this.output);
            console.log(e);
        });
    }
    static async process(config) {
        const env = new Environment(config);
        await config.transform?.(env);
    }
}
export function defineAssetConfig(userOptions = {}) {
    const options = {
        envFile: ".env",
        srcDir: "resources",
        dstDir: "generated",
        ...userOptions,
    };
    if (!isAbsolute(options.envFile)) {
        options.envFile = join(cwd(), options.envFile);
    }
    try {
        loadEnvFile(options.envFile);
        options.srcDir = userOptions.srcDir ?? env.SRC_DIR ?? options.srcDir;
        options.dstDir = userOptions.dstDir ?? env.DST_DIR ?? options.dstDir;
    }
    catch (_e) { }
    if (!isAbsolute(options.srcDir)) {
        options.srcDir = join(cwd(), options.srcDir);
    }
    if (!isAbsolute(options.dstDir)) {
        options.dstDir = join(cwd(), options.dstDir);
    }
    return options;
}
