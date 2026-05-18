import {
	type ETC1SOptions,
	Mode,
	type UASTCOptions,
} from "@gltf-transform/cli";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { type DracoOptions, draco } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import type { Asset } from "../asset.ts";
import { ktx2Transform } from "./ktx2-transform.ts";

export interface OptimizeModelsOptions {
	dracoOptions?: DracoOptions;
	ktx2TransformOptions?: Omit<ETC1SOptions | UASTCOptions, "encoder">;
}

export const KTX2Mode: typeof Mode = Mode;

export async function gltfOptimize(
	assets: Asset[],
	options: OptimizeModelsOptions = {},
): Promise<void> {
	const io = new NodeIO()
		.registerExtensions(ALL_EXTENSIONS)
		.registerDependencies({
			"draco3d.decoder": await draco3d.createDecoderModule(), // Optional.
			"draco3d.encoder": await draco3d.createEncoderModule(), // Optional.
		});

	for (const { input, output } of assets) {
		const doc = await io.read(input);

		await doc.transform(
			draco(options.dracoOptions),
			ktx2Transform({
				encoder: sharp,
				mode: Mode.ETC1S,
				...options?.ktx2TransformOptions,
			}),
		);

		await io.write(output, doc);
	}
}
