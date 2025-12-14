import { readFile, writeFile } from "node:fs/promises";

const ROOT_PACKAGE_JSON = new URL("../package.json", import.meta.url);

const PACKAGE_PATHS = [
	new URL("../packages/radix-ui/package.json", import.meta.url),
	new URL("../packages/base-ui/package.json", import.meta.url),
];

const CORE_PKG_NAME = "@hirotoshioi/hiraku-core";

function formatJson(value) {
	return `${JSON.stringify(value, null, "\t")}\n`;
}

async function readJson(url) {
	return JSON.parse(await readFile(url, "utf8"));
}

async function main() {
	const root = await readJson(ROOT_PACKAGE_JSON);
	const version = root.version;

	if (typeof version !== "string" || version.trim() === "") {
		throw new Error("Root package.json version is missing/invalid");
	}

	await Promise.all(
		PACKAGE_PATHS.map(async (pkgUrl) => {
			const pkg = await readJson(pkgUrl);

			if (!pkg.dependencies || typeof pkg.dependencies !== "object") {
				pkg.dependencies = {};
			}

			pkg.dependencies[CORE_PKG_NAME] = version;

			await writeFile(pkgUrl, formatJson(pkg));
		}),
	);

	process.stdout.write(
		`Synced ${CORE_PKG_NAME} dependency to ${version} in ${PACKAGE_PATHS.length} packages\n`,
	);
}

await main();
