import htmlPlugin from "@chialab/esbuild-plugin-html";
import { type BuildOptions, build } from "esbuild";
import fileRawPlugin from "../src/plugins/file-raw-plugin.esbuild.ts";
import fileUrlPlugin from "../src/plugins/file-url-plugin.esbuild.ts";

export async function getPackage(path: string): Promise<any> {
	const { default: pkg } = (await import(path, {
		with: { type: "json" },
		// biome-ignore lint/suspicious/noExplicitAny: idk>
	})) as { default: any };
	return pkg;
}

export async function buildForNode(options: BuildOptions): Promise<void> {
	await build({
		bundle: true,
		splitting: true,
		target: "node20",
		format: "esm",
		platform: "node",
		packages: "external",
		chunkNames: "chunks/[ext]/[name]-[hash]",
		...options,
	});
}

export async function buildForWeb(options: BuildOptions): Promise<void> {
	await build({
		bundle: true,
		splitting: true,
		format: "esm",
		assetNames: "assets/[name]-[hash]",
		chunkNames: "[ext]/[name]-[hash]",
		...options,
		plugins: [
			htmlPlugin(),
			fileUrlPlugin(),
			fileRawPlugin(),
			...(options.plugins ?? []),
		],
	});
}
