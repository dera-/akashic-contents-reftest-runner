import * as fs from "fs";
import * as path from "path"; 
import * as commander from "commander";

const run = require("./run");
const updateExpected = require("./updateExpected");

export function cli(argv: any): void {
	const ver = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8")).version;
	commander
		.version(ver)
		.description("Development server for Akashic Engine to debug multiple-player games")
		.option("-m, --mode <mode>", `The port number to listen. default: test`)
		.option("-o, --output <output>", `The host name of the server. default: ${process.cwd()}`)
		.parse(argv);
	if (! /^test|data$/.test(commander.mode)) {
		console.error("Please specify test or data.");
		process.exit(1);
	}
	if (!commander.output || !fs.existsSync(path.join(commander.output, "game.json"))) {
		console.error("Please specify directroy included game.json");
		process.exit(1);
	}
	Promise.resolve()
	.then(() => {
		if (commander.mode === "data") {
			return updateExpected(commander.output);
		} else {
			return run(commander.output);
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
