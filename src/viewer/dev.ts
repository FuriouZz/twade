import { context } from "esbuild";
import threePlugin from "../plugins/three-plugin.esbuild.js";

const ctx = await context({
	entryPoints: ["./src/main.ts"],
	outdir: "public",
	bundle: true,
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

const { hosts, port } = await ctx.serve({
	servedir: "public",
});

console.log(hosts.map((host) => `http://${host}:${port}`).join("\n"));
