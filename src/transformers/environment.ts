import { mkdirSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";
import { Asset } from "./asset";
import { transformPath } from "./lib";
import type { AssetConfig } from "./types";
import { findFiles } from "./utils/file";
import type { TransformPathOptions } from "./utils/path";

export class Environment {
	options: AssetConfig;
	joinSourceDir: (asset: string | Asset) => string;
	joinOutputDir: (asset: string | Asset) => string;

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

	getAssets = (pattern: string): Asset[] => {
		const files = findFiles(join(this.options.srcDir, pattern));
		const assets: Asset[] = [];
		for (const absInput of files) {
			if (!absInput) continue;
			const input = relative(this.options.srcDir, absInput);
			const asset = new Asset(input, input);
			assets.push(asset);
		}
		return assets;
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
					const asset = new Asset(input, input);
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
		return Promise.all(
			this.assets(pattern, cb).map((res) => {
				return Promise.resolve(res);
			}),
		);
	}

	ensureDir = (asset: string | Asset): void => {
		const dir = this.dst(
			typeof asset === "string" ? asset : dirname(asset.output),
		);
		mkdirSync(join(dir), { recursive: true });
	};
}
