import { toktx, } from "@gltf-transform/cli";
import { KHRTextureBasisu } from "@gltf-transform/extensions";
import { createTransform } from "@gltf-transform/functions";
export const ktx2Transform = (options) => {
    return createTransform("KTX2_TRANSFORM", async (doc) => {
        await doc.transform(toktx(options));
        doc.createExtension(KHRTextureBasisu).setRequired(true);
    });
};
