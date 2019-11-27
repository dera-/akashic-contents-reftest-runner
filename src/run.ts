import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import * as pngjs from "pngjs";

const shell = require("shelljs");
const pixelmatch = require("pixelmatch");
const akashicCliServeModule = require("./akashicCliServeModule");
const saveScreenshots = require("./saveScreenshots");

const assertScreenshot = (expectedPath: string, targetPath: string) => {
	// 予め用意しているスクリーンショットと画像を比較する時diffをどこまで許容するかの値
	// このdiffの値域は0～1で、2つの画像でdiffがある領域の割合を示していて、閾値は0.1%に設定している
	const screenshotDiffThreshold = 0.001;
	const expected = pngjs.PNG.sync.read(fs.readFileSync(expectedPath));
	const actual = pngjs.PNG.sync.read(fs.readFileSync(targetPath));
	const {width, height} = expected;
	const diff = new pngjs.PNG({width, height});
	// thresholdはピクセルごとの差異の閾値を表している
	const value = pixelmatch(expected.data, actual.data, diff.data, width, height, {threshold: 0.1});
	console.log(`diff: ${100 * value / (width * height)}%`);
	assert(value <= screenshotDiffThreshold * width * height);
};

module.exports = async (targetDir: string) => {
	try {
		console.log("start to get screenshots and run tests");
		const url = await akashicCliServeModule.start(targetDir);
		const outputDir = path.join(targetDir, "out");
		if (!fs.existsSync(outputDir)) {
			shell.mkdir("-p", [outputDir]);
		}
		await saveScreenshots(url, outputDir);
		const imageFileNames = fs.readdirSync(outputDir);
		for (let fileName of imageFileNames) {
			console.log(`validate ${fileName}`);
			assertScreenshot(
				path.join(targetDir, "expected", fileName),
				path.join(outputDir, fileName)
			);
		}
		console.log("finish to get screenshots and run tests");
	} finally {
		await akashicCliServeModule.stop();
	}
};
