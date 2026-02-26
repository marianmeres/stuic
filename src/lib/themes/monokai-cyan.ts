import type { TokenSchema } from "../utils/design-tokens.js";

// Monokai Cyan — Monokai's cyan/type color as primary with purple accent
// Approximation of classic Monokai palette to Tailwind colors

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-cyan-600)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-violet-500)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-rose-600)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-emerald-600)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-stone-50)",
					foreground: "var(--color-stone-900)",
				},
				muted: {
					DEFAULT: "var(--color-stone-100)",
					foreground: "var(--color-stone-500)",
				},
				surface: {
					DEFAULT: "var(--color-stone-200)",
					foreground: "var(--color-stone-900)",
				},
				"surface-1": {
					DEFAULT: "var(--color-stone-300)",
					foreground: "var(--color-stone-900)",
				},
			},
			single: {
				foreground: "var(--color-stone-900)",
				border: {
					DEFAULT: "var(--color-stone-300)",
				},
				input: {
					DEFAULT: "var(--color-stone-50)",
					hover: "var(--color-stone-100)",
				},
				ring: "color-mix(in srgb, var(--color-cyan-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-cyan-400)",
				foreground: "var(--color-black)",
			},
			accent: {
				DEFAULT: "var(--color-violet-400)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-rose-500)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-stone-900)",
					foreground: "var(--color-stone-50)",
				},
				muted: {
					DEFAULT: "var(--color-stone-800)",
					foreground: "var(--color-stone-400)",
				},
				surface: {
					DEFAULT: "var(--color-stone-700)",
					foreground: "var(--color-stone-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-stone-600)",
					foreground: "var(--color-stone-200)",
				},
			},
			single: {
				foreground: "var(--color-stone-50)",
				border: {
					DEFAULT: "var(--color-stone-700)",
				},
				input: {
					DEFAULT: "var(--color-stone-900)",
					hover: "var(--color-stone-800)",
				},
				ring: "color-mix(in srgb, var(--color-cyan-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
