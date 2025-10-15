import { cwd } from "node:process";
import type { Plugin } from "esbuild";
import { type Options, threePlugin } from "./three-plugin.ts";

export default function esbuildThreePlugin(
	userOptions: Partial<Options>,
): Plugin {
	return {
		name: "three-plugin",
		async setup(build) {
			const plugin = threePlugin({
				rootDir: build.initialOptions.absWorkingDir ?? cwd(),
				outDir: build.initialOptions.outdir ?? "./public/three",
				...userOptions,
			});

			await plugin.copy();
		},
	};
}
