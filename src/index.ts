import * as fs from "fs";
import * as path from "path";
import * as commander from "commander";

const shell = require("shelljs");
const run = require("./run");
const updateExpected = require("./updateExpected");

export function cli(argv: any): void {
	const ver = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8")).version;
	commander
		.version(ver)
		.description("integration test of specified akashic-content")
		.option("-m, --mode <mode>", `specify execution mode(test or expected). default: test`)
		.option("-o, --output <output>", `specify directory path including game.json of target. default: ${process.cwd()}`)
		.parse(argv);
	if (!commander.mode) {
		commander.mode = "test";
	} else if (! /^test|expected$/.test(commander.mode)) {
		console.error("Please specify test or expected.");
		process.exit(1);
	}
	if (!commander.output) {
		commander.output = process.cwd();
	}
	if (!fs.existsSync(path.join(commander.output, "game.json"))) {
		console.error("Please specify directroy included game.json");
		process.exit(1);
	}
	Promise.resolve()
	.then(() => {
		const imgDirName = "reftest";
		const imgDirPath = path.join(commander.output, imgDirName);
		if (!fs.existsSync(imgDirPath)) {
			shell.mkdir("-p", [imgDirPath]);
		}
		if (commander.mode === "expected") {
			return updateExpected(commander.output, imgDirName);
		} else {
			return run(commander.output, imgDirName);
		}
	})
	.then(() => {
		console.log("Success!");
		process.exit(0);
	})
	.catch((err: any) => {
		console.error("Failed", err);
		process.exit(1);
	});
}
