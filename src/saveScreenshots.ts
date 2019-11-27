import * as fs from "fs";
import * as path from "path";
import * as puppeteer from "puppeteer";

const WAITING_SERVE_TIME = 5000;
const createWaiter = () => {
	let resolve: () => void = null;
	let reject: () => void = null;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

module.exports = async(url: string, dir: string) => {
	const contentWaiter = createWaiter();
	const browser = await puppeteer.launch({
		headless: true,
		executablePath: process.env.CHROME_BIN || null,
		args: ["--no-sandbox", "--headless", "--disable-gpu", "--disable-dev-shm-usage"]
	});
	const page = await browser.newPage();
	page.on("console", async (msg) => {
		const data = await Promise.all(msg.args().map((a) => a.jsonValue()));
		// スクリーンショットがbase64のバイナリとしてconsole上に流れるので、デコードして保存する
		if (data[0] === "akashic-contents-reftest:finish") {
			contentWaiter.resolve();
		} else if (data.length === 3 && data[0] === "akashic-contents-reftest:image") {
			const decode = Buffer.from(data[2], "base64");
			fs.writeFileSync(path.join(dir, data[1]), decode);
			console.log(`${data[1]} is saved`);
		}
	});
	await page.waitFor(WAITING_SERVE_TIME); // serveが起動するのを待つために少し長めに待つ
	await page.goto(url);
	await contentWaiter.promise; // コンテンツ側からfinishが送られてくるまで待つ
	await page.close();
	await browser.close();
};
