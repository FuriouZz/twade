import type { Plugin } from "esbuild";
import { type Options, threePlugin } from "./plugin";
import { cwd } from "node:process";

export default function esbuildThreePlugin(
	userOptions: Partial<Options>,
): Plugin {
	return {
		name: "three-plugin",
		async setup(build) {
			const plugin = threePlugin({
				rootDir: build.initialOptions.absWorkingDir ?? cwd(),
				...userOptions,
			});

			await plugin.copy();
		},
	};
}
