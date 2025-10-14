import { build } from "esbuild";

await build({
	entryPoints: {
		lib: "./src/lib.ts",
	},
	bundle: true,
	target: "node20",
	format: "esm",
	outdir: "./dist",
	external: [
		"@gltf-transform/cli",
		"@gltf-transform/core",
		"@gltf-transform/extensions",
		"@gltf-transform/functions",
		"@monogrid/gainmap-js",
		"draco3dgltf",
		"playwright",
		"sharp",
	],
	platform: "node",
});
