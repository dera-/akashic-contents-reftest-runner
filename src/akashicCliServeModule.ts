import { execSync, spawn } from "child_process";
import * as path from "path";
import * as getPort from "get-port";

let childProcess: any;

module.exports = {
	start: async (contentPath: string): Promise<string> => {
		const port = await getPort();
		const akashicCliServePath = path.join(__dirname, "..", "node_modules", ".bin", "akashic-cli-serve");
		console.log("akashic-cli-serve version: " + execSync(`${akashicCliServePath} --version`));
		childProcess = spawn(
			akashicCliServePath,
			["-p", port.toString(), "--debug-playlog", "playlog.json"],
			{cwd: contentPath}
		);
		childProcess.stdout.on("data", (data: any) => {
			console.log(`akashic-cli-serve stdout: ${data}`);
		});
		console.log("setup server. port:" + port);
		return `http://localhost:${port}/public?playId=0&mode=replay`;
	},
	stop: (): Promise<void> => {
		if (!childProcess) {
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			console.log("teardown server.");
			// akashic-cli-serve側でサーバーが閉じられるのを待つ
			childProcess.on("exit", (code: number, signal: string) => {
				console.log(`akashic-cli-serve exit.(exit-code: ${code}, signal: ${signal})`);
				if (code === 0 || signal === "SIGTERM") {
					resolve();
				} else {
					reject(new Error(`akashic-cli-serve could not finish normally.(exit-code: ${code}, signal: ${signal})`));
				}
			});
			childProcess.kill("SIGTERM");
			childProcess = undefined;
		});
	}
};
