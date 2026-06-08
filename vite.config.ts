/// <reference types="node" />
import { sveltekit } from "@sveltejs/kit/vite";
// import { defineConfig } from 'vite';
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: parseInt(process.env.DEV_PORT || "8886"),
		// expose on all
		host: true,
	},
	test: {
		// Two projects, routed purely by filename:
		//   *.test.ts        -> fast node env (pure logic, the existing suites)
		//   *.svelte.test.ts -> real browser (Chromium) for component/DOM/$effect tests
		// See docs/component-testing/01-framework-setup.md
		projects: [
			{
				extends: true, // inherit root plugins (tailwind + sveltekit)
				test: {
					name: "server",
					environment: "node",
					include: ["src/**/*.test.ts"],
					// *.svelte.test.ts also ends in .test.ts, so it must be excluded here
					exclude: ["src/**/*.svelte.test.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "client",
					include: ["src/**/*.svelte.test.ts"],
					setupFiles: ["vitest-browser-svelte"],
					// Browser-mode tests are real Chromium interactions; under full-suite
					// load (parallel files contending for CPU) a multi-step reactive test
					// can exceed a tight budget. 5s keeps expect.element retries honest
					// without masking genuine hangs. See docs/component-testing.
					testTimeout: 5000,
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
