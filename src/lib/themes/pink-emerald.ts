import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-pink-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-pink-700)",
				active: "var(--color-pink-800)",
			},
			accent: {
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-emerald-600)",
				active: "var(--color-emerald-700)",
			},
			destructive: {
				DEFAULT: "var(--color-pink-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-pink-700)",
				active: "var(--color-pink-800)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-amber-600)",
				active: "var(--color-amber-700)",
			},
			success: {
				DEFAULT: "var(--color-emerald-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-emerald-700)",
				active: "var(--color-emerald-800)",
			},
			info: {
				DEFAULT: "var(--color-cyan-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-cyan-600)",
				active: "var(--color-cyan-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-stone-900)",
				},
				surface: {
					DEFAULT: "var(--color-stone-200)",
					foreground: "var(--color-stone-900)",
					hover: "var(--color-stone-300)",
					active: "var(--color-stone-400)",
				},
				"surface-1": {
					DEFAULT: "var(--color-stone-300)",
					foreground: "var(--color-stone-900)",
					hover: "var(--color-stone-400)",
					active: "var(--color-stone-500)",
				},
				muted: {
					DEFAULT: "var(--color-stone-100)",
					foreground: "var(--color-stone-500)",
					hover: "var(--color-stone-200)",
					active: "var(--color-stone-300)",
				},
			},
			single: {
				foreground: "var(--color-stone-900)",
				border: {
					DEFAULT: "var(--color-stone-300)",
					hover: "var(--color-stone-400)",
					active: "var(--color-stone-500)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-stone-50)",
				},
				ring: "color-mix(in srgb, var(--color-pink-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-pink-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-pink-400)",
				active: "var(--color-pink-300)",
			},
			accent: {
				DEFAULT: "var(--color-emerald-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-emerald-300)",
				active: "var(--color-emerald-200)",
			},
			destructive: {
				DEFAULT: "var(--color-pink-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-pink-400)",
				active: "var(--color-pink-300)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-amber-300)",
				active: "var(--color-amber-200)",
			},
			success: {
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-emerald-400)",
				active: "var(--color-emerald-300)",
			},
			info: {
				DEFAULT: "var(--color-cyan-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-cyan-300)",
				active: "var(--color-cyan-200)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-stone-900)",
					foreground: "var(--color-stone-50)",
				},
				surface: {
					DEFAULT: "var(--color-stone-800)",
					foreground: "var(--color-stone-100)",
					hover: "var(--color-stone-700)",
					active: "var(--color-stone-600)",
				},
				"surface-1": {
					DEFAULT: "var(--color-stone-700)",
					foreground: "var(--color-stone-100)",
					hover: "var(--color-stone-600)",
					active: "var(--color-stone-500)",
				},
				muted: {
					DEFAULT: "var(--color-stone-700)",
					foreground: "var(--color-stone-400)",
					hover: "var(--color-stone-600)",
					active: "var(--color-stone-500)",
				},
			},
			single: {
				foreground: "var(--color-stone-50)",
				border: {
					DEFAULT: "var(--color-stone-700)",
					hover: "var(--color-stone-600)",
					active: "var(--color-stone-500)",
				},
				input: {
					DEFAULT: "var(--color-stone-800)",
					hover: "var(--color-stone-700)",
				},
				ring: "color-mix(in srgb, var(--color-pink-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
