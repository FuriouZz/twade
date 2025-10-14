import { spawnSync } from "node:child_process";
import { copyFileSync, rmSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import process from "node:process";
import sharp, {} from "sharp";
export function ceilMultipleOfFour(value) {
    if (value <= 4)
        return 4;
    return value % 4 ? value + 4 - (value % 4) : value;
}
export async function resizeImage(input, output, userOptions) {
    let img = sharp(input);
    const { format, ...options } = (typeof userOptions === "function"
        ? await userOptions(sharp)
        : userOptions) ?? {};
    img = img.resize(options);
    if (format) {
        img = img.toFormat(format);
    }
    return img.toFile(output);
}
async function _resizeImage({ input, output, width, height, format, }) {
    const md = await sharp(input).metadata();
    if (!(md.width && md.height))
        return input;
    if (width !== md.width || height !== md.height) {
        if (!output) {
            const base = basename(input, extname(input));
            output = join(process.cwd(), "tmp", relative(process.cwd(), `${base}-${width}x${height}.png`));
        }
        console.log(`Resize ${relative(process.cwd(), input)} to ${width}x${height}`);
        await sharp(input)
            .resize({
            width,
            height,
            fit: "inside",
        })
            .toFormat(format ?? md.format)
            .toFile(output);
    }
    else {
        output = input;
    }
    return output;
}
export async function resizeToMultipleOfFour(from) {
    const md = await sharp(from).metadata();
    if (!(md.width && md.height))
        return;
    const width = ceilMultipleOfFour(md.width);
    const height = ceilMultipleOfFour(md.height);
    if (width !== md.width || height !== md.height) {
        console.log(`POF ${relative(process.cwd(), from)} to ${width}x${height}`);
        const to = `${from}-${Date.now()}`;
        copyFileSync(from, to);
        await sharp(to)
            .resize({ width, height, fit: "cover" })
            .toFormat(md.format)
            .toFile(from);
        rmSync(to);
    }
}
export async function toKTX2(input, output, options) {
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
    const algorithmOptions = [];
    const algorithm = opts.algorithm ?? "etc1s";
    if (algorithm === "etc1s") {
        algorithmOptions.push("--qlevel 255", // With best quality [between 0-255, default: 128]
        `--clevel ${opts.compression ?? 5}`);
    }
    else if (algorithm === "uastc") {
        algorithmOptions.push(`--uastc_quality ${opts.uastc_quality ?? 4}`);
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
