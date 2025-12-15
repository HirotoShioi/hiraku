import { defineConfig } from "bumpp";

export default defineConfig({
	// Monorepo: bump root + published packages
	files: ["package.json", "packages/*/package.json"],
	recursive: true,
	all: true,
	commit: true,
	tag: true,
	push: true,
});
