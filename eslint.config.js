import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			// Respect the codebase's `_`-prefix convention for intentionally
			// unused bindings (e.g. signature-contract params like the validate
			// action's `(value, _context, _el)`).
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
		},
	},
	{
		// mcp.ts targets the Deno/JSR runtime (npm:/jsr: imports that don't
		// resolve in this Node/TS build), so it legitimately needs @ts-nocheck.
		files: ["src/lib/mcp.ts"],
		rules: { "@typescript-eslint/ban-ts-comment": "off" },
	},
	{
		ignores: ["dist/", ".svelte-kit/", "node_modules/"],
	}
);
