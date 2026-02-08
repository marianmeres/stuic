import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-orange-600)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-pink-500)",
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
				DEFAULT: "var(--color-emerald-600)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-orange-50)",
					foreground: "var(--color-stone-900)",
				},
				muted: {
					DEFAULT: "var(--color-amber-100)",
					foreground: "var(--color-stone-500)",
				},
				surface: {
					DEFAULT: "var(--color-amber-200)",
					foreground: "var(--color-stone-900)",
				},
				"surface-1": {
					DEFAULT: "var(--color-amber-300)",
					foreground: "var(--color-stone-900)",
				},
			},
			single: {
				foreground: "var(--color-stone-900)",
				border: {
					DEFAULT: "var(--color-amber-300)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-orange-50)",
				},
				ring: "color-mix(in srgb, var(--color-orange-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-orange-500)",
				foreground: "var(--color-black)",
			},
			accent: {
				DEFAULT: "var(--color-pink-400)",
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
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-stone-950)",
					foreground: "var(--color-stone-50)",
				},
				muted: {
					DEFAULT: "var(--color-stone-900)",
					foreground: "var(--color-stone-500)",
				},
				surface: {
					DEFAULT: "var(--color-stone-800)",
					foreground: "var(--color-stone-400)",
				},
				"surface-1": {
					DEFAULT: "var(--color-stone-700)",
					foreground: "var(--color-stone-300)",
				},
			},
			single: {
				foreground: "var(--color-stone-50)",
				border: {
					DEFAULT: "var(--color-stone-700)",
				},
				input: {
					DEFAULT: "var(--color-stone-950)",
					hover: "var(--color-stone-900)",
				},
				ring: "color-mix(in srgb, var(--color-orange-500) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
