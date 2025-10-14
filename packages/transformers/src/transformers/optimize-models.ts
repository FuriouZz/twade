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
import type { Environment } from "../environment.ts";

export interface OptimizeModelsOptions {
	dracoOptions?: DracoOptions;
	ktx2TransformOptions?: Omit<ETC1SOptions | UASTCOptions, "encoder">;
}

export const KTX2Mode = Mode;

export async function optimizeModels(
	env: Environment,
	assets: Asset[],
	options: OptimizeModelsOptions = {},
) {
	const io = new NodeIO()
		.registerExtensions(ALL_EXTENSIONS)
		.registerDependencies({
			"draco3d.decoder": await draco3d.createDecoderModule(), // Optional.
			"draco3d.encoder": await draco3d.createEncoderModule(), // Optional.
		});

	for (const asset of assets) {
		await asset.wrap(async () => {
			const doc = await io.read(env.joinSourceDir(asset));

			await doc.transform(
				draco(options.dracoOptions),
				ktx2Transform({
					encoder: sharp,
					mode: Mode.ETC1S,
					...options?.ktx2TransformOptions,
				}),
			);

			await io.write(env.joinOutputDir(asset.output), doc);
		});
	}
}
