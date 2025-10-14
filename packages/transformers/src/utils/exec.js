import { spawn } from "node:child_process";
function commandBuilder(opts) {
    const options = { stdio: "inherit", shell: true, ...opts };
    const ret = (...cmd) => {
        return new Promise((resolve, reject) => {
            const ps = spawn(cmd.join(" "), options);
            let stdout = null;
            let stderr = null;
            const stdoutChunks = [];
            const stderrChunks = [];
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
                    reject(new Error(`Execution failed\nCommand: ${cmd}\nCode: ${code}\nSignal: ${signal}\n`));
                }
                else {
                    resolve({ code, signal, stdout, stderr });
                }
            });
        });
    };
    ret.with = (key, value) => {
        return commandBuilder({ ...options, [key]: value });
    };
    ret.run = ret;
    return ret;
}
export const $ = commandBuilder();
