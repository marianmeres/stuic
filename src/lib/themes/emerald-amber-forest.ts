import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-emerald-700)",
				foreground: "var(--color-white)",
				hover: "var(--color-emerald-800)",
				active: "var(--color-emerald-900)",
			},
			accent: {
				DEFAULT: "var(--color-amber-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-amber-700)",
				active: "var(--color-amber-800)",
			},
			destructive: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-700)",
				active: "var(--color-red-800)",
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
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-amber-50)",
					foreground: "var(--color-stone-900)",
				},
				surface: {
					DEFAULT: "var(--color-amber-100)",
					foreground: "var(--color-amber-900)",
					hover: "var(--color-amber-200)",
					active: "var(--color-amber-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-amber-200)",
					foreground: "var(--color-amber-900)",
					hover: "var(--color-amber-300)",
					active: "var(--color-amber-400)",
				},
				muted: {
					DEFAULT: "var(--color-amber-100)",
					foreground: "var(--color-amber-500)",
					hover: "var(--color-amber-200)",
					active: "var(--color-amber-300)",
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
					DEFAULT: "var(--color-amber-50)",
					hover: "var(--color-stone-100)",
				},
				ring: "color-mix(in srgb, var(--color-emerald-700) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-emerald-400)",
				active: "var(--color-emerald-300)",
			},
			accent: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-black)",
				hover: "var(--color-amber-400)",
				active: "var(--color-amber-300)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
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
					DEFAULT: "var(--color-stone-600)",
					hover: "var(--color-stone-500)",
					active: "var(--color-stone-400)",
				},
				input: {
					DEFAULT: "var(--color-stone-800)",
					hover: "var(--color-stone-700)",
				},
				ring: "color-mix(in srgb, var(--color-emerald-500) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
