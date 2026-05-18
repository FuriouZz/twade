import { cwd } from "node:process";
import { Asset } from "./asset";

const files = ["js", "mjs", "ts", "mts"];

for (const file of files) {
	try {
		const { default: config } = await import(`${cwd()}/assets.config.${file}`);
		Asset.process(config);
		break;
	} catch (_) {}
}
