import { cpSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { cwd } from "node:process";

export interface Options {
	/**
	 * Source directory
	 */
	rootDir: string;

	/**
	 * Source directory
	 */
	srcDir: string;

	/**
	 * Output directory
	 */
	outDir: string;

	/**
	 * Libraries to copy from three/examples/jsm/libs
	 * to your public directory
	 */
	libraries: string[];
}

export function threePlugin(userOptions: Partial<Options>) {
	const options: Options = {
		rootDir: cwd(),
		srcDir: "./node_modules/three/examples/jsm/libs",
		outDir: "./public/three",
		libraries: [],
		...userOptions,
	};

	const copy = async () => {
		const { libraries } = options;

		const srcDir = resolve(
			isAbsolute(options.srcDir)
				? options.srcDir
				: join(options.rootDir, options.srcDir),
		);

		const outDir = resolve(
			isAbsolute(options.outDir)
				? options.outDir
				: join(options.rootDir, options.outDir),
		);

		for (const library of libraries) {
			const absInput = join(srcDir, library);
			const absOutput = join(outDir, library);
			cpSync(absInput, absOutput, { recursive: true, force: false });
		}
	};

	return {
		options,
		copy,
	};
}
