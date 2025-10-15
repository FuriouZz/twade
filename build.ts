import { cpSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { build } from "esbuild";
import threePlugin from "./src/plugins/three-plugin.esbuild.ts";
import { findFiles } from "./src/transformers/utils/file.ts";
import { transformPath } from "./src/transformers/utils/path.ts";

const DST_DIR = "./publish/dist";

rmSync(DST_DIR, { recursive: true, force: true });

// Build for node
await build({
	entryPoints: {
		// BINS
		"bin/twade-transform": "./src/transformers/main.ts",
		"bin/twade-viewer": "./src/viewer/main.ts",
		// LIBRARIES
		"transformers/lib": "./src/transformers/lib.ts",
		"plugins/three-plugin": "./src/plugins/three-plugin.ts",
		"plugins/three-plugin.vite": "./src/plugins/three-plugin.vite.ts",
		"plugins/three-plugin.esbuild": "./src/plugins/three-plugin.esbuild.ts",
	},
	bundle: true,
	splitting: true,
	target: "node20",
	format: "esm",
	outdir: DST_DIR,
	platform: "node",
	packages: "external",
});

// Build for browser
cpSync("./src/viewer/public", join(DST_DIR, "browser/viewer"), {
	recursive: true,
	force: true,
});

await build({
	entryPoints: {
		main: "./src/viewer/src/main.ts",
	},
	bundle: true,
	splitting: true,
	format: "esm",
	outdir: join(DST_DIR, "browser/viewer"),
	plugins: [
		threePlugin({
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

async function getPackage(path: string) {
	const { default: pkg } = (await import(path, {
		with: { type: "json" },
		// biome-ignore lint/suspicious/noExplicitAny: idk>
	})) as { default: any };
	return pkg;
}

const pkg = await getPackage("./publish/package.json");
pkg.bin = {};
pkg.exports = {};
pkg.dependencies = {};

const files = findFiles(DST_DIR)
	.map((f) => `./${relative("./publish", f)}`)
	.filter(
		(f) =>
			f.endsWith(".js") && !f.includes("chunk-") && !f.includes("/browser/"),
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

	const types = transformPath(file.replace("dist/", "dist/types/"), {
		ext: ".d.ts",
	});
	pkg.exports[input] = { types, default: file };
	pkg.exports[input.replace(".js", "")] = { types, default: file };
}

const root = await getPackage("./package.json");
pkg.dependencies = root.dependencies;

writeFileSync("./publish/package.json", JSON.stringify(pkg, null, 2));
