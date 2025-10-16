import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "esbuild";

export default function esbuildFilePlugin(): Plugin {
	return {
		name: "file-plugin",
		setup(build) {
			build.onResolve({ filter: /\?raw$/ }, async (args) => {
				return {
					path: resolve(args.resolveDir, args.path.replace("?raw", "")),
					namespace: "raw-loader",
					suffix: "?raw",
				};
			});

			build.onLoad({ filter: /./, namespace: "raw-loader" }, async (args) => {
				return {
					contents: await readFile(args.path),
					loader: "text",
				};
			});
		},
	};
}
