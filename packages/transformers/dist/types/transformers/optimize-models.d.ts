import { type ETC1SOptions, type UASTCOptions } from "@gltf-transform/cli";
import { type DracoOptions } from "@gltf-transform/functions";
import type { Asset } from "../asset.ts";
import type { Environment } from "../environment.ts";
export interface OptimizeModelsOptions {
    dracoOptions?: DracoOptions;
    ktx2TransformOptions?: Omit<ETC1SOptions | UASTCOptions, "encoder">;
}
export declare const KTX2Mode: {
    ETC1S: string;
    UASTC: string;
};
export declare function optimizeModels(env: Environment, assets: Asset[], options?: OptimizeModelsOptions): Promise<void>;
