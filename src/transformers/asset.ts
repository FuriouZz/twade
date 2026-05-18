import { isAbsolute, join } from "node:path";
import { cwd, env, loadEnvFile } from "node:process";
import type { AssetConfig } from "./types";

export interface Asset {
	input: string;
	output: string;
}

export function defineAssetConfig(
	userOptions: Partial<AssetConfig> = {},
): AssetConfig {
	const options: AssetConfig = {
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
	} catch (_e) {}

	if (!isAbsolute(options.srcDir)) {
		options.srcDir = join(cwd(), options.srcDir);
	}

	if (!isAbsolute(options.dstDir)) {
		options.dstDir = join(cwd(), options.dstDir);
	}

	return options;
}
