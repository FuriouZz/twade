// src/asset.ts
import { isAbsolute, join as join2 } from "node:path";
import { cwd, env, loadEnvFile } from "node:process";

// src/environment.ts
import { mkdirSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

// src/utils/file.ts
import { spawnSync } from "node:child_process";
function getFiles(pattern) {
  const ps = spawnSync("ls", [pattern], { shell: true, stdio: "pipe" });
  return ps.stdout.toString("utf-8").trim().split(/\n/);
}

// src/environment.ts
var Environment = class {
  options;
  constructor(config) {
    this.options = config;
  }
  joinSourceDir = (asset) => {
    return normalize(
      join(
        this.options.srcDir,
        typeof asset === "string" ? asset : asset.input
      )
    );
  };
  joinOutputDir = (asset) => {
    const absInput = this.joinSourceDir(asset);
    return normalize(
      absInput.replace(this.options.srcDir, this.options.dstDir)
    );
  };
  getAssets = (pattern) => {
    const files = getFiles(join(this.options.srcDir, pattern));
    const assets = [];
    for (const absInput of files) {
      if (!absInput) continue;
      const input = relative(this.options.srcDir, absInput);
      const asset = new Asset(input, input);
      assets.push(asset);
    }
    return assets;
  };
  ensureDir = (asset) => {
    const dir = this.joinOutputDir(
      typeof asset === "string" ? asset : dirname(asset.output)
    );
    mkdirSync(join(dir), { recursive: true });
  };
};

// src/asset.ts
var Asset = class {
  input;
  output;
  constructor(input, output) {
    this.input = input;
    this.output = output;
  }
  async wrap(cb) {
    console.log("process:", this.input);
    const promise = typeof cb === "function" ? cb() : cb;
    await promise.then(
      () => {
        console.log("created:", this.output);
      },
      (e) => {
        console.log("failed to create:", this.output);
        console.log(e);
      }
    );
  }
  static async process(config) {
    const env2 = new Environment(config);
    await config.transform?.(env2);
  }
};
function defineAssetConfig(userOptions = {}) {
  const options = {
    envFile: ".env",
    srcDir: "resources",
    dstDir: "generated",
    ...userOptions
  };
  if (!isAbsolute(options.envFile)) {
    options.envFile = join2(cwd(), options.envFile);
  }
  try {
    loadEnvFile(options.envFile);
    options.srcDir = userOptions.srcDir ?? env.SRC_DIR ?? options.srcDir;
    options.dstDir = userOptions.dstDir ?? env.DST_DIR ?? options.dstDir;
  } catch (_e) {
  }
  if (!isAbsolute(options.srcDir)) {
    options.srcDir = join2(cwd(), options.srcDir);
  }
  if (!isAbsolute(options.dstDir)) {
    options.dstDir = join2(cwd(), options.dstDir);
  }
  return options;
}

// src/transformers/generate-gainmap.ts
import { chromium } from "playwright";

// src/utils/path.ts
import { basename, dirname as dirname2, extname, join as join3 } from "node:path";
function transformPath(path, options) {
  const ext = extname(path);
  const base = basename(path, ext);
  const dir = dirname2(path);
  const opts = {
    ext,
    base,
    dir,
    prefix: "",
    suffix: "",
    ...options
  };
  if (!opts.ext.startsWith(".")) {
    opts.ext = `.${opts.ext}`;
  }
  return join3(
    opts.dir,
    [opts.prefix, opts.base, opts.suffix, opts.ext].join("")
  );
}

// src/transformers/generate-gainmap.ts
async function convert(env2, asset, page) {
  await page.reload();
  await page.setInputFiles("input", env2.joinSourceDir(asset));
  await page.waitForFunction(() => () => {
    const buttons = Array.from(document.querySelectorAll("button"));
    for (const button of buttons) {
      if (button.textContent === "Save") return true;
    }
    return false;
  });
  await page.getByRole("button", { name: "Save" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "JPEG" }).click()
  ]);
  const output = transformPath(asset.output, { ext: "jpg" });
  await download.saveAs(env2.joinOutputDir(output));
}
async function generateGainmap(pipeline, assets) {
  const browser = await chromium.launch({
    // headless: false,
    // executablePath:
    // 	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();
  await page.goto("https://gainmap-creator.monogrid.com/");
  for (const asset of assets) {
    await asset.wrap(convert(pipeline, asset, page));
  }
  await browser.close();
}

// src/utils/image.ts
import sharp from "sharp";
async function resizeImage(input, output, userOptions) {
  let img = sharp(input);
  const { format, ...options } = (typeof userOptions === "function" ? await userOptions(sharp) : userOptions) ?? {};
  img = img.resize(options);
  if (format) {
    img = img.toFormat(format);
  }
  return img.toFile(output);
}

// src/transformers/optimize-models.ts
import {
  Mode
} from "@gltf-transform/cli";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { draco } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp2 from "sharp";

// src/transformers/ktx2-transform.ts
import {
  toktx
} from "@gltf-transform/cli";
import { KHRTextureBasisu } from "@gltf-transform/extensions";
import { createTransform } from "@gltf-transform/functions";
var ktx2Transform = (options) => {
  return createTransform("KTX2_TRANSFORM", async (doc) => {
    await doc.transform(toktx(options));
    doc.createExtension(KHRTextureBasisu).setRequired(true);
  });
};

// src/transformers/optimize-models.ts
var KTX2Mode = Mode;
async function optimizeModels(env2, assets, options = {}) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    // Optional.
    "draco3d.encoder": await draco3d.createEncoderModule()
    // Optional.
  });
  for (const asset of assets) {
    await asset.wrap(async () => {
      const doc = await io.read(env2.joinSourceDir(asset));
      await doc.transform(
        draco(options.dracoOptions),
        ktx2Transform({
          encoder: sharp2,
          mode: Mode.ETC1S,
          ...options?.ktx2TransformOptions
        })
      );
      await io.write(env2.joinOutputDir(asset.output), doc);
    });
  }
}
export {
  Asset,
  Environment,
  KTX2Mode,
  defineAssetConfig,
  generateGainmap,
  optimizeModels,
  resizeImage,
  transformPath
};
