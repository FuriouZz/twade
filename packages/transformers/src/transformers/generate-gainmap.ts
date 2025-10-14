import { type Page, chromium } from "playwright";

import type { Asset } from "../asset.ts";
import type { Environment } from "../environment.ts";
import { transformPath } from "../utils/path.ts";

async function convert(env: Environment, asset: Asset, page: Page) {
	await page.reload();

	await page.setInputFiles("input", env.joinSourceDir(asset));

	await page.waitForFunction(() => () => {
		const buttons = Array.from(document.querySelectorAll("button"));
		for (const button of buttons) {
			if (button.textContent === "Save") return true;
		}
		return false;
	});

	await page.getByRole("button", { name: "Save" }).click();
	// await waitSeconds(1);

	const [download] = await Promise.all([
		page.waitForEvent("download"),
		page.getByRole("button", { name: "JPEG" }).click(),
	]);

	const output = transformPath(asset.output, { ext: "jpg" });
	await download.saveAs(env.joinOutputDir(output));
}

export async function generateGainmap(pipeline: Environment, assets: Asset[]) {
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
