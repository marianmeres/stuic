/// <reference types="node" />
import adapter from "@sveltejs/adapter-auto";
import { sveltekit } from "@sveltejs/kit/vite";
// import { defineConfig } from 'vite';
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
	plugins: [
		tailwindcss(),
		// SvelteKit 3 takes its config here (svelte.config.js is no longer read)
		sveltekit({ adapter: adapter() }),
	],
	server: {
		port: parseInt(process.env.DEV_PORT || "8886"),
		// expose on all
		host: true,
	},
	test: {
		// Two projects, routed purely by filename:
		//   *.test.ts        -> fast node env (pure logic, the existing suites)
		//   *.svelte.test.ts -> real browser (Chromium) for component/DOM/$effect tests
		// See docs/_archive/component-testing/01-framework-setup.md
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
					// without masking genuine hangs. See docs/_archive/component-testing/.
					testTimeout: 5000,
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({
							// lets tests put files/images on the real browser clipboard
							// (native-path paste tests, e.g. FieldAssets `pasteable`)
							contextOptions: {
								permissions: ["clipboard-read", "clipboard-write"],
							},
						}),
						instances: [{ browser: "chromium" }],
						// Vitest 5 flipped the default to exact (full, case-sensitive) text
						// locators. The suite was written against substring matching, and
						// flipping it would silently weaken every negative assertion
						// (`.not.toBeInTheDocument()` on a partial string). Pass
						// `{ exact: true }` per locator where precision matters.
						locators: { exact: false },
					},
				},
			},
		],
	},
});
