// src/main.ts
import { resolve, dirname } from "node:path";
import { cwd, argv } from "node:process";
import { fileURLToPath } from "node:url";
import { Asset } from "transformers";
if (argv[2] === "preview") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  import(resolve(__dirname, "../../viewer/serve.ts"));
} else if (argv[2] === "transform") {
  const { default: config } = await import(`${cwd()}/assets.config.ts`);
  Asset.process(config);
}
