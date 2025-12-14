import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	test: {
		globals: true,
		setupFiles: "./vitest.setup.ts",
		include: ["src/**/*.test.browser.tsx"],
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: "chromium" }],
		},
	},
});
