// Fails the build when a client entry loses its "use client" directive.
// Next.js App Router needs it to render ModalProvider from Server Components.
import { readFileSync } from "node:fs";

const files = process.argv.slice(2);

for (const file of files) {
	const firstLine = readFileSync(file, "utf8").split("\n", 1)[0];
	if (!/^["']use client["'];?$/.test(firstLine)) {
		console.error(`${file} must start with "use client" (found: ${firstLine})`);
		process.exit(1);
	}
}
