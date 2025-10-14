// src/three-plugin/plugin.ts
import { cpSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { cwd } from "node:process";
function threePlugin(userOptions) {
  const options = {
    rootDir: cwd(),
    srcDir: "./node_modules/three/examples/jsm/libs",
    outDir: "./public/three",
    libraries: [],
    ...userOptions
  };
  const copy = async () => {
    const { libraries } = options;
    const srcDir = resolve(
      isAbsolute(options.srcDir) ? options.srcDir : join(options.rootDir, options.srcDir)
    );
    const outDir = resolve(
      isAbsolute(options.outDir) ? options.outDir : join(options.rootDir, options.outDir)
    );
    for (const library of libraries) {
      const absInput = join(srcDir, library);
      const absOutput = join(outDir, library);
      cpSync(absInput, absOutput, { recursive: true, force: false });
    }
  };
  return {
    options,
    copy
  };
}

// src/three-plugin/esbuild.ts
function esbuildThreePlugin(userOptions) {
  return {
    name: "three-plugin",
    async setup(build) {
      const plugin = threePlugin({
        rootDir: build.initialOptions.absWorkingDir,
        ...userOptions
      });
      await plugin.copy();
    }
  };
}
export {
  esbuildThreePlugin as default
};
