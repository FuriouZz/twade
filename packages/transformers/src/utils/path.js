import { basename, dirname, extname, join } from "node:path";
export function transformPath(path, options) {
    const ext = extname(path);
    const base = basename(path, ext);
    const dir = dirname(path);
    const opts = {
        ext: ext,
        base: base,
        dir: dir,
        prefix: "",
        suffix: "",
        ...options,
    };
    if (!opts.ext.startsWith(".")) {
        opts.ext = `.${opts.ext}`;
    }
    return join(opts.dir, [opts.prefix, opts.base, opts.suffix, opts.ext].join(""));
}
