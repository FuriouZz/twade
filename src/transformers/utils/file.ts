import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, extname } from "node:path";
import { cwd } from "node:process";
import { FileList } from "filelist";

export function ensureDirSync(path: string): void {
	let dir = path;
	if (extname(dir)) {
		dir = dirname(path);
	}
	mkdirSync(dir, { recursive: true });
}

export function ls(pattern: string): string[] {
	const ps = spawnSync("ls", [pattern], { shell: true, stdio: "pipe" });
	return ps.stdout.toString("utf-8").trim().split(/\n/);
}

export function find(rootPath: string = cwd()): string[] {
	const ps = spawnSync("find", [rootPath, "-type", "f"], {
		shell: true,
		stdio: "pipe",
	});
	return ps.stdout.toString("utf-8").trim().split(/\n/);
}

export function findFiles(pattern: string): string[] {
	const f = new FileList();
	return f.include(pattern).toArray();
}
