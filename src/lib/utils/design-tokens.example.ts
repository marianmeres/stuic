import { type TokenSchema, generateCssTokens, toCssString } from "./design-tokens.ts";

// ============================================================================
// Example Token Definition (with hover and active states)
// ============================================================================

const tokens: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-blue-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-blue-700)",
				active: "var(--color-blue-800)",
				// foregroundHover/Active not defined → falls back to foreground
			},
			accent: {
				DEFAULT: "var(--color-violet-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-violet-600)",
				active: "var(--color-violet-700)",
			},
			destructive: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-700)",
				active: "var(--color-red-800)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-black)",
				hover: "var(--color-amber-600)",
				active: "var(--color-amber-700)",
			},
			success: {
				DEFAULT: "var(--color-green-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-green-700)",
				active: "var(--color-green-800)",
			},
			info: {
				DEFAULT: "var(--color-sky-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-sky-600)",
				active: "var(--color-sky-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-slate-900)",
					// No hover/active for background (rarely needed)
				},
				surface: {
					DEFAULT: "var(--color-slate-50)",
					foreground: "var(--color-slate-900)",
					hover: "var(--color-slate-100)",
					active: "var(--color-slate-200)",
				},
				muted: {
					DEFAULT: "var(--color-slate-100)",
					foreground: "var(--color-slate-500)",
					hover: "var(--color-slate-200)",
					active: "var(--color-slate-300)",
				},
			},
			single: {
				// Plain string: same value for all states
				foreground: "var(--color-slate-900)",

				// Object with explicit hover/active
				border: {
					DEFAULT: "var(--color-slate-200)",
					hover: "var(--color-slate-300)",
					active: "var(--color-slate-400)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-slate-50)",
					// active not defined → falls back to DEFAULT
				},
				ring: "var(--color-blue-600)",
			},
		},
	},
};

// ============================================================================
// Generate Output
// ============================================================================

const generated = generateCssTokens(tokens);

console.log("Generated tokens object:");
console.log(JSON.stringify(generated, null, 2));

console.log("\n\nAs CSS:");
console.log(toCssString(generated));
