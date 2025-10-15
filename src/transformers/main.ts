import { cwd } from "node:process";
import { Asset } from "./asset";

const { default: config } = await import(`${cwd()}/assets.config.ts`);
Asset.process(config);
