import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "esbuild";

export default function esbuildFilePlugin(): Plugin {
	return {
		name: "file-plugin",
		setup(build) {
			build.onResolve({ filter: /\?url$/ }, async (args) => {
				return {
					path: resolve(args.resolveDir, args.path.replace("?url", "")),
					namespace: "url-loader",
					suffix: "?url",
				};
			});

			build.onLoad({ filter: /./, namespace: "url-loader" }, async (args) => {
				return {
					contents: await readFile(args.path),
					loader: "file",
				};
			});
		},
	};
}
