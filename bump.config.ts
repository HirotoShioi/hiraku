import { defineConfig } from "bumpp";

export default defineConfig({
	// Monorepo: bump root + published packages
	files: ["package.json", "packages/*/package.json"],
	all: true,
	commit: true,
	tag: true,
	push: true,
});
