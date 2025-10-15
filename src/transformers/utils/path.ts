import { basename, dirname, extname, join } from "node:path";

export function transformPath(
	path: string,
	options?: {
		dir?: string;
		ext?: string;
		base?: string;
		prefix?: string;
		suffix?: string;
		prefixRelativePath?: boolean;
	},
): string {
	const ext = extname(path);
	const base = basename(path, ext);
	const dir = dirname(path);

	const opts = {
		ext: ext,
		base: base,
		dir: dir,
		prefix: "",
		suffix: "",
		prefixRelativePath: true,
		...options,
	};

	if (opts.ext && !opts.ext.startsWith(".")) {
		opts.ext = `.${opts.ext}`;
	}

	opts.ext = opts.ext.replaceAll("{}", ext);
	opts.dir = opts.dir.replaceAll("{}", dir);
	opts.base = opts.base.replaceAll("{}", base);

	let basePath = opts.prefixRelativePath ? "./" : "";

	if (path.startsWith("/")) {
		basePath = "";
	}

	return (
		basePath +
		join(opts.dir, [opts.prefix, opts.base, opts.suffix, opts.ext].join(""))
	);
}
