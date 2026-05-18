import { mkdirSync } from "node:fs";
import { join, normalize, relative } from "node:path";
import type { Asset } from "./asset";
import { transformPath } from "./lib";
import type { AssetConfig } from "./types";
import { findFiles } from "./utils/file";
import type { TransformPathOptions } from "./utils/path";
import { ask, choices, prompt, singleChoice } from "./utils/prompt";

export class Environment {
	options: AssetConfig;
	joinSourceDir: (asset: string | Asset) => string;
	joinOutputDir: (asset: string | Asset) => string;

	ask: typeof ask = ask;
	singleChoice: typeof singleChoice = singleChoice;
	choices: typeof choices = choices;
	prompt: typeof prompt = prompt;

	constructor(config: AssetConfig) {
		this.options = config;
		this.joinSourceDir = this.src;
		this.joinOutputDir = this.dst;
	}

	src = (asset: string | Asset, options?: TransformPathOptions): string => {
		return normalize(
			join(
				this.options.srcDir,
				transformPath(typeof asset === "string" ? asset : asset.input, options),
			),
		);
	};

	dst = (asset: string | Asset, options?: TransformPathOptions): string => {
		const absInput = this.src(asset, options);
		return normalize(
			absInput.replace(this.options.srcDir, this.options.dstDir),
		);
	};

	assets(pattern: string | Asset[]): Asset[];
	assets<T>(pattern: string | Asset[], cb: (asset: Asset) => T): T[];
	assets<T>(pattern: string | Asset[], cb?: (asset: Asset) => T): T[] {
		let assets: Asset[];

		if (Array.isArray(pattern)) {
			assets = pattern;
		} else {
			assets = findFiles(join(this.options.srcDir, pattern))
				.filter((f) => !!f)
				.map((absInput) => {
					const input = relative(this.options.srcDir, absInput);
					const asset = { input, output: input };
					return asset;
				});
		}

		if (cb) {
			return assets.map((asset) => cb(asset));
		}

		return assets as T[];
	}

	async assetsAsync<T>(
		pattern: string | Asset[],
		cb: (asset: Asset) => Promise<T>,
	): Promise<T[]> {
		return Promise.all(this.assets(pattern, cb));
	}

	ensureDir = (path: string): void => {
		mkdirSync(path, { recursive: true });
	};
}
