import { mkdirSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";
import { Asset } from "./asset";
import type { AssetConfig } from "./types";
import { getFiles } from "./utils/file";

export class Environment {
	options: AssetConfig;

	constructor(config: AssetConfig) {
		this.options = config;
	}

	joinSourceDir = (asset: string | Asset): string => {
		return normalize(
			join(
				this.options.srcDir,
				typeof asset === "string" ? asset : asset.input,
			),
		);
	};

	joinOutputDir = (asset: string | Asset): string => {
		const absInput = this.joinSourceDir(asset);
		return normalize(
			absInput.replace(this.options.srcDir, this.options.dstDir),
		);
	};

	getAssets = (pattern: string): Asset[] => {
		const files = getFiles(join(this.options.srcDir, pattern));
		const assets: Asset[] = [];
		for (const absInput of files) {
			if (!absInput) continue;
			const input = relative(this.options.srcDir, absInput);
			const asset = new Asset(input, input);
			assets.push(asset);
		}
		return assets;
	};

	ensureDir = (asset: string | Asset): void => {
		const dir = this.joinOutputDir(
			typeof asset === "string" ? asset : dirname(asset.output),
		);
		mkdirSync(join(dir), { recursive: true });
	};
}
