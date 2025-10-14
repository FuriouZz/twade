import { mkdirSync } from "node:fs";
import { dirname, extname } from "node:path";
import { spawnSync } from "node:child_process";

export function ensureDirSync(path: string) {
	let dir = path;
	if (extname(dir)) {
		dir = dirname(path);
	}
	mkdirSync(dir, { recursive: true });
}

export function getFiles(pattern: string) {
	const ps = spawnSync("ls", [pattern], { shell: true, stdio: "pipe" });
	return ps.stdout.toString("utf-8").trim().split(/\n/);
}
