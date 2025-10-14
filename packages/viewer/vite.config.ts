import { join } from "node:path";
import { cwd } from "node:process";
import { defineConfig } from "vite";
import threePlugin from "../vite-plugins/three-plugin";

export default defineConfig({
	plugins: [
		threePlugin({
			externals: [
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
	resolve: {
		alias: {
			"@": join(cwd(), "./src"),
		},
	},
});
