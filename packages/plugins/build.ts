import { build } from "esbuild";

await build({
	entryPoints: {
		"three-plugin": "./src/three-plugin/plugin.ts",
		"three-plugin.vite": "./src/three-plugin/vite.ts",
		"three-plugin.esbuild": "./src/three-plugin/esbuild.ts",
	},
	bundle: true,
	target: "node20",
	format: "esm",
	outdir: "./dist",
	platform: "node",
});
