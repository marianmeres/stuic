import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-blue-600)",
				foreground: "var(--color-white)",
				// foregroundHover/Active not defined → falls back to foreground
			},
			accent: {
				DEFAULT: "var(--color-violet-500)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-white)",
			},
			success: {
				DEFAULT: "var(--color-green-600)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-slate-900)",
					// No hover/active for background (rarely needed)
				},
				muted: {
					DEFAULT: "var(--color-slate-100)",
					foreground: "var(--color-slate-500)",
				},
				surface: {
					DEFAULT: "var(--color-slate-200)",
					foreground: "var(--color-slate-900)",
				},
				"surface-1": {
					DEFAULT: "var(--color-slate-300)",
					foreground: "var(--color-slate-900)",
				},
			},
			single: {
				// Plain string: same value for all states
				foreground: "var(--color-slate-900)",

				// Object with explicit hover/active
				border: {
					DEFAULT: "var(--color-slate-300)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-slate-50)",
					// active not defined → falls back to DEFAULT
				},
				ring: "color-mix(in srgb, var(--color-blue-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-blue-500)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-violet-400)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-green-500)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-slate-900)",
					foreground: "var(--color-slate-50)",
				},
				muted: {
					DEFAULT: "var(--color-slate-800)",
					foreground: "var(--color-slate-400)",
				},
				surface: {
					DEFAULT: "var(--color-slate-700)",
					foreground: "var(--color-slate-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-slate-600)",
					foreground: "var(--color-slate-200)",
				},
			},
			single: {
				foreground: "var(--color-slate-50)",
				border: {
					DEFAULT: "var(--color-slate-700)",
				},
				input: {
					DEFAULT: "var(--color-slate-800)",
					hover: "var(--color-slate-700)",
				},
				ring: "color-mix(in srgb, var(--color-blue-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
