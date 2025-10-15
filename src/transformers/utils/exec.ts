import { spawn, type SpawnOptions } from "node:child_process";

interface CommandInfo {
	code: number | null;
	signal: string | null;
	stdout: null | Buffer;
	stderr: null | Buffer;
}
interface CommandBuilder {
	(...cmd: string[]): Promise<CommandInfo>;
	with<T extends SpawnOptions, K extends keyof T>(
		key: K,
		value: T[K],
	): CommandBuilder;
	run(...cmd: string[]): Promise<CommandInfo>;
}

function commandBuilder(opts?: SpawnOptions): CommandBuilder {
	const options: SpawnOptions = { stdio: "inherit", shell: true, ...opts };

	const ret = (...cmd: string[]): Promise<CommandInfo> => {
		return new Promise<CommandInfo>((resolve, reject) => {
			const ps = spawn(cmd.join(" "), options);
			let stdout: Buffer | null = null;
			let stderr: Buffer | null = null;
			const stdoutChunks: Buffer[] = [];
			const stderrChunks: Buffer[] = [];

			if (ps.stdout) {
				ps.stdout.on("data", (chunk) => {
					stdoutChunks.push(chunk);
				});
				ps.stdout.once("end", () => {
					stdout = Buffer.concat(stdoutChunks);
				});
			}

			if (ps.stderr) {
				ps.stderr.on("data", (chunk) => {
					stderrChunks.push(chunk);
				});
				ps.stderr.once("end", () => {
					stderr = Buffer.concat(stderrChunks);
				});
			}

			ps.once("error", reject);
			ps.once("close", (code, signal) => {
				if (typeof code === "number" && code !== 0) {
					reject(
						new Error(
							`Execution failed\nCommand: ${cmd}\nCode: ${code}\nSignal: ${signal}\n`,
						),
					);
				} else {
					resolve({ code, signal, stdout, stderr });
				}
			});
		});
	};

	ret.with = <T extends SpawnOptions, K extends keyof T>(
		key: K,
		value: T[K],
	): CommandBuilder => {
		return commandBuilder({ ...options, [key]: value });
	};

	ret.run = ret;

	return ret;
}

export const $: CommandBuilder = commandBuilder();
