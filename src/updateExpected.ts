import * as fs from "fs";
import * as path from "path";

const shell = require("shelljs");
const akashicCliServeModule = require("./akashicCliServeModule");
const saveScreenshots = require("./saveScreenshots");

module.exports = async (targetDir: string, imgDirName: string) => {
	try {
		console.log("start to get screenshots");
		const url = await akashicCliServeModule.start(targetDir);
		const outputDir = path.join(targetDir, imgDirName, "expected");
		if (!fs.existsSync(outputDir)) {
			shell.mkdir("-p", [outputDir]);
		}
		await saveScreenshots(url, outputDir);
		console.log("finish to get screenshots");
	} finally {
		await akashicCliServeModule.stop();
	}
};
