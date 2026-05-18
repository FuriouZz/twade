import { statSync } from "node:fs";
import { cwd } from "node:process";
import { Environment } from "./environment";

const exts = ["js", "mjs", "ts", "mts"];

for (const ext of exts) {
	const path = `${cwd()}/assets.config.${ext}`;

	try {
		const stat = statSync(path);
		if (!stat.isFile()) {
			throw new Error("Is not a file");
		}
	} catch (_) {
		continue;
	}

	const { default: config } = await import(path);
	const env = new Environment(config);
	await config.transform?.(env);
	break;
}
