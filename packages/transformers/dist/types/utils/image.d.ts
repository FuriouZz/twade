import sharp, { type FormatEnum } from "sharp";
export declare function ceilMultipleOfFour(value: number): number;
type ResizeImageOptions = sharp.ResizeOptions & {
    format?: keyof FormatEnum;
};
export declare function resizeImage(input: string, output: string, userOptions?: ResizeImageOptions | ((s: typeof sharp) => ResizeImageOptions | undefined | Promise<ResizeImageOptions | undefined>)): Promise<sharp.OutputInfo>;
export declare function resizeToMultipleOfFour(from: string): Promise<void>;
export declare function toKTX2(input: string, output: string, options?: {
    algorithm?: "astc" | "etc1s" | "uastc";
    compression?: number;
    uastc_quality?: 0 | 1 | 2 | 3 | 4;
    zcmp?: number;
    flipY?: boolean;
    encoding?: "linear" | "srgb";
    generateMipmap?: boolean;
    resize?: [number, number];
    format?: keyof FormatEnum;
    verbose?: boolean;
}): Promise<void>;
export {};
