import type { Environment } from "./environment";

export interface AssetConfig {
	envFile: string;
	srcDir: string;
	dstDir: string;
	transform?: (pipeline: Environment) => Promise<unknown>;
}
