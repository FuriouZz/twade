import { build } from "esbuild";

await build({
	entryPoints: {
		main: "./src/main.ts",
	},
	bundle: true,
	target: "node20",
	format: "esm",
	outdir: "./dist",
	platform: "node",
	external: ["transformers"],
});
