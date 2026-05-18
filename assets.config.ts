import {
	defineAssetConfig,
	generateGainmap,
	optimizeModels,
} from "./publish/dist/node/transformers/lib.js";

export default defineAssetConfig({
	async transform(env) {
		if (await env.ask("Let's go?")) {
			console.log("cool");
		}
		// await generateGainmap(env, env.getAssets("*.{exr,hdr}"));
		// await optimizeModels(env, env.getAssets("*.glb"));
	},
});
