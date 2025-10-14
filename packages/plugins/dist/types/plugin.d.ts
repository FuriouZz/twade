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
export declare function threePlugin(userOptions: Partial<Options>): {
    options: Options;
    copy: () => Promise<void>;
};
