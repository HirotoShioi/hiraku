import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "playground/src"),
		},
	},
	test: {
		projects: [
			{
				extends: "./vitest.config.ts",
				test: {
					environment: "happy-dom",
					globals: true,
					setupFiles: "./tests/setup.ts",
					name: "unit-tests",
				},
			},
			{
				extends: "./vitest.config.ts",
				test: {
					globals: true,
					setupFiles: "./tests/setup.browser.ts",
					name: "browser",
					include: ["playground/src/**/*.test.browser.tsx"],
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
