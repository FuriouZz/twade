import type { Plugin } from "vite";
import { type Options, threePlugin } from "./plugin";

export default function viteThreePlugin(userOptions: Partial<Options>): Plugin {
	const plugin = threePlugin(userOptions);

	return {
		name: "three-plugin",

		configResolved(config) {
			Object.assign(plugin.options, {
				rootDir: userOptions.rootDir ?? config.root,
			});
		},

		async buildStart() {
			return plugin.copy();
		},
	};
}
