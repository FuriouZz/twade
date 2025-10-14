import { type SpawnOptions } from "node:child_process";
export declare const $: {
    (...cmd: string[]): Promise<{
        code: number | null;
        signal: string | null;
        stdout: null | Buffer;
        stderr: null | Buffer;
    }>;
    with<T extends SpawnOptions, K extends keyof T>(key: K, value: T[K]): /*elided*/ any;
    run: /*elided*/ any;
};
