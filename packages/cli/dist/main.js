// src/main.ts
import { cwd, argv } from "node:process";
import { Asset } from "transformers";
if (argv[2] === "preview") {
} else if (argv[2] === "transform") {
  const { default: config } = await import(`${cwd()}/assets.config.ts`);
  Asset.process(config);
}
