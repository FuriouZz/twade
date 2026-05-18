import { chromium, type Page } from "playwright";

import type { Asset } from "../asset.ts";
import { transformPath } from "../utils/path.ts";

async function convert(asset: Asset, page: Page): Promise<void> {
	await page.reload();

	await page.setInputFiles("input", asset.input);

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
	await download.saveAs(output);
}

export async function generateGainmap(assets: Asset[]): Promise<void> {
	const browser = await chromium.launch({
		// headless: false,
		// executablePath:
		// 	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	});
	const page = await browser.newPage();

	await page.goto("https://gainmap-creator.monogrid.com/");

	for (const asset of assets) {
		await convert(asset, page);
	}

	await browser.close();
}
