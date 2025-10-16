import { rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { cwd } from "node:process";
import { buildForNode, buildForWeb, getPackage } from "./scripts/functions.ts";
import threePlugin from "./src/plugins/three-plugin.esbuild.ts";
import { findFiles } from "./src/transformers/utils/file.ts";
import { transformPath } from "./src/transformers/utils/path.ts";

const DST_DIR = join(cwd(), "./publish/dist");

rmSync(DST_DIR, { recursive: true, force: true });

await buildForNode({
	entryPoints: {
		// BINS
		"bin/twade-transform": "./src/transformers/main.ts",
		"bin/twade-viewer": "./src/viewer/main.ts",
		// LIBRARIES
		"node/transformers/lib": "./src/transformers/lib.ts",
		"node/plugins/three-plugin": "./src/plugins/three-plugin.ts",
		"node/plugins/three-plugin.vite": "./src/plugins/three-plugin.vite.ts",
		"node/plugins/three-plugin.esbuild":
			"./src/plugins/three-plugin.esbuild.ts",
	},
	outdir: DST_DIR,
});

await buildForWeb({
	entryPoints: ["./src/viewer/index.html"],
	outdir: join(DST_DIR, "web/viewer"),
	plugins: [
		threePlugin({
			outDir: join(DST_DIR, "web/viewer/three"),
			libraries: [
				// BASIS
				"basis/basis_transcoder.js",
				"basis/basis_transcoder.wasm",

				// DRACO
				"draco/gltf/draco_encoder.js",
				"draco/gltf/draco_decoder.js",
				"draco/gltf/draco_decoder.wasm",
				"draco/gltf/draco_wasm_wrapper.js",
				"draco/draco_encoder.js",
				"draco/draco_decoder.js",
				"draco/draco_decoder.wasm",
				"draco/draco_wasm_wrapper.js",
			],
		}),
	],
});

const pkg = await getPackage(join(DST_DIR, "../package.json"));
pkg.bin = {};
pkg.exports = {};
pkg.dependencies = {};

const files = findFiles(DST_DIR)
	.map((f) => `./${relative("./publish", f)}`)
	.filter(
		(f) => f.endsWith(".js") && !f.includes("chunk-") && !f.includes("/web/"),
	);

for (const file of files) {
	let input = file.replace("dist/", "");

	if (input.startsWith("./bin")) {
		const name = transformPath(input, {
			prefixRelativePath: false,
			ext: "",
			dir: "",
		});
		pkg.bin[name] = file;
		continue;
	}

	if (input.endsWith("/lib.js")) {
		input = `${dirname(input)}.js`;
	}

	input = input.replace("/node/", "/");

	const types = transformPath(file.replace("/node/", "/types/"), {
		ext: ".d.ts",
	});
	pkg.exports[input] = { types, default: file };
	pkg.exports[input.replace(".js", "")] = { types, default: file };
}

const root = await getPackage(join(cwd(), "package.json"));
pkg.dependencies = root.dependencies;

writeFileSync("./publish/package.json", JSON.stringify(pkg, null, 2));
