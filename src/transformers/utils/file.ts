import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, extname } from "node:path";
import { cwd } from "node:process";

export function ensureDirSync(path: string): void {
	let dir = path;
	if (extname(dir)) {
		dir = dirname(path);
	}
	mkdirSync(dir, { recursive: true });
}

export function getFiles(pattern: string): string[] {
	const ps = spawnSync("ls", [pattern], { shell: true, stdio: "pipe" });
	return ps.stdout.toString("utf-8").trim().split(/\n/);
}

export function findFiles(rootPath: string = cwd()): string[] {
	const ps = spawnSync("find", [rootPath, "-type", "f"], {
		shell: true,
		stdio: "pipe",
	});
	return ps.stdout.toString("utf-8").trim().split(/\n/);
}
