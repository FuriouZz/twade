import {
	defineAssetConfig,
	generateGainmap,
	optimizeModels,
} from "./packages/transformer/src/index.ts";

export default defineAssetConfig({
	async transform({ getAssets }) {
		await generateGainmap(getAssets("*.{exr,hdr}"));
		await optimizeModels(getAssets("*.glb"));
	},
});
