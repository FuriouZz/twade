import { spawnSync } from "node:child_process";
import { copyFileSync, rmSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import process from "node:process";
import sharp, { type FormatEnum } from "sharp";

export function ceilMultipleOfFour(value: number) {
	if (value <= 4) return 4;
	return value % 4 ? value + 4 - (value % 4) : value;
}

type ResizeImageOptions = sharp.ResizeOptions & {
	format?: keyof FormatEnum;
};

export async function resizeImage(
	input: string,
	output: string,
	userOptions?:
		| ResizeImageOptions
		| ((
				s: typeof sharp,
		  ) =>
				| ResizeImageOptions
				| undefined
				| Promise<ResizeImageOptions | undefined>),
) {
	let img = sharp(input);
	const { format, ...options } =
		(typeof userOptions === "function"
			? await userOptions(sharp)
			: userOptions) ?? {};
	img = img.resize(options);
	if (format) {
		img = img.toFormat(format);
	}
	return img.toFile(output);
}

async function _resizeImage({
	input,
	output,
	width,
	height,
	format,
}: {
	input: string;
	output?: string;
	width: number;
	height: number;
	format?: keyof FormatEnum;
}) {
	const md = await sharp(input).metadata();
	if (!(md.width && md.height)) return input;

	if (width !== md.width || height !== md.height) {
		if (!output) {
			const base = basename(input, extname(input));
			output = join(
				process.cwd(),
				"tmp",
				relative(process.cwd(), `${base}-${width}x${height}.png`),
			);
		}

		console.log(
			`Resize ${relative(process.cwd(), input)} to ${width}x${height}`,
		);
		await sharp(input)
			.resize({
				width,
				height,
				fit: "inside",
			})
			.toFormat(format ?? (md.format as keyof FormatEnum))
			.toFile(output);
	} else {
		output = input;
	}

	return output;
}

export async function resizeToMultipleOfFour(from: string) {
	const md = await sharp(from).metadata();
	if (!(md.width && md.height)) return;

	const width = ceilMultipleOfFour(md.width);
	const height = ceilMultipleOfFour(md.height);

	if (width !== md.width || height !== md.height) {
		console.log(`POF ${relative(process.cwd(), from)} to ${width}x${height}`);
		const to = `${from}-${Date.now()}`;
		copyFileSync(from, to);
		await sharp(to)
			.resize({ width, height, fit: "cover" })
			.toFormat(md.format as keyof FormatEnum)
			.toFile(from);
		rmSync(to);
	}
}

export async function toKTX2(
	input: string,
	output: string,
	options?: {
		algorithm?: "astc" | "etc1s" | "uastc";
		compression?: number;
		/*
		 * This optional parameter selects a speed vs quality tradeoff as shown in the following table:
		 * |Level|Speed    |Quality|
		 * |-----|---------|-------|
		 * |0    |Fatest   |43.45dB|
		 * |1    |Faster   |46.49dB|
		 * |2    |Default  |47.47dB|
		 * |3    |Slower   |48.01dB|
		 * |4    |Very slow|48.24dB|
		 * You are strongly encouraged to also specify --zcmp to losslessly compress the UASTC data.
		 * This and any LZ-style compression can be made more effective by conditioning
		 * the UASTC texture data using the Rate Distortion Optimization (RDO) post-process stage.
		 */
		uastc_quality?: 0 | 1 | 2 | 3 | 4;
		/*
		 * Supercompress the data with Zstandard. Implies --t2.
		 * Can be used with data in any format except ETC1S / BasisLZ.
		 * Most effective with RDO-conditioned UASTC or uncompressed formats.
		 * The optional compressionLevel range is 1 - 22 and the default is 3.
		 * Lower values=faster but give less compression.
		 * Values above 20 should be used with caution as they require more memory.
		 */
		zcmp?: number;
		flipY?: boolean;
		encoding?: "linear" | "srgb";
		generateMipmap?: boolean;
		resize?: [number, number];
		format?: keyof FormatEnum;
		verbose?: boolean;
	},
) {
	const opts = { ...options };
	let from = input;
	const to = output;
	if (opts?.resize) {
		from = await _resizeImage({
			input: input,
			width: opts.resize[0],
			height: opts.resize[1],
			format: opts.format,
		});
	}
	await resizeToMultipleOfFour(from);

	const algorithmOptions: string[] = [];
	const algorithm = opts.algorithm ?? "etc1s";
	if (algorithm === "etc1s") {
		algorithmOptions.push(
			"--qlevel 255", // With best quality [between 0-255, default: 128]
			`--clevel ${opts.compression ?? 5}`, // With max compression [between 0-5, default: 1]
		);
	} else if (algorithm === "uastc") {
		algorithmOptions.push(
			`--uastc_quality ${opts.uastc_quality ?? 4}`, // With max compression [between 0-5, default: 1]
		);
	}
	const cmd = [
		"toktx",
		opts.generateMipmap ? "--genmipmap" : "", // Generate mipmap
		"--2d", // 2D Texture
		"--target_type RGBA", // Target RGBA
		"--t2", // Specify KTX2 container
		`--encode ${algorithm}`, // Compress with ETC1S for low/medium quality(why not 🤷?)
		...algorithmOptions,
		opts.zcmp ? `--zcmp ${opts.zcmp}` : "",
		opts.flipY ? "--lower_left_maps_to_s0t0" : "--upper_left_maps_to_s0t0",
		opts.encoding ? `--assign_oetf ${opts.encoding}` : "", // Force the created texture to have the specified transfer function
		// opts.encoding ? `--convert_oetf ${opts.encoding}` : "", // Force the created texture to have the specified transfer function
		opts.verbose ? "--verbose" : "",
		to,
		from,
	].join(" ");
	spawnSync(cmd, { shell: true, stdio: "inherit" });
}
