import {
	type ETC1SOptions,
	toktx,
	type UASTCOptions,
} from "@gltf-transform/cli";
import { KHRTextureBasisu } from "@gltf-transform/extensions";
import { createTransform } from "@gltf-transform/functions";

export const ktx2Transform = (options: ETC1SOptions | UASTCOptions) => {
	return createTransform("KTX2_TRANSFORM", async (doc) => {
		await doc.transform(toktx(options));
		doc.createExtension(KHRTextureBasisu).setRequired(true);
	});
};
