import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-orange-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-orange-700)",
				active: "var(--color-orange-800)",
			},
			accent: {
				DEFAULT: "var(--color-pink-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-pink-600)",
				active: "var(--color-pink-700)",
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
					DEFAULT: "var(--color-orange-50)",
					foreground: "var(--color-stone-900)",
				},
				surface: {
					DEFAULT: "var(--color-amber-200)",
					foreground: "var(--color-stone-900)",
					hover: "var(--color-amber-300)",
					active: "var(--color-amber-400)",
				},
				"surface-1": {
					DEFAULT: "var(--color-amber-300)",
					foreground: "var(--color-stone-900)",
					hover: "var(--color-amber-400)",
					active: "var(--color-amber-500)",
				},
				muted: {
					DEFAULT: "var(--color-amber-100)",
					foreground: "var(--color-stone-500)",
					hover: "var(--color-amber-200)",
					active: "var(--color-amber-300)",
				},
			},
			single: {
				foreground: "var(--color-stone-900)",
				border: {
					DEFAULT: "var(--color-amber-300)",
					hover: "var(--color-amber-400)",
					active: "var(--color-amber-500)",
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
				hover: "var(--color-orange-400)",
				active: "var(--color-orange-300)",
			},
			accent: {
				DEFAULT: "var(--color-pink-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-pink-300)",
				active: "var(--color-pink-200)",
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
			info: {
				DEFAULT: "var(--color-sky-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-sky-300)",
				active: "var(--color-sky-200)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-stone-950)",
					foreground: "var(--color-stone-50)",
				},
				surface: {
					DEFAULT: "var(--color-stone-900)",
					foreground: "var(--color-stone-100)",
					hover: "var(--color-stone-800)",
					active: "var(--color-stone-700)",
				},
				"surface-1": {
					DEFAULT: "var(--color-stone-800)",
					foreground: "var(--color-stone-100)",
					hover: "var(--color-stone-700)",
					active: "var(--color-stone-600)",
				},
				muted: {
					DEFAULT: "var(--color-stone-800)",
					foreground: "var(--color-stone-500)",
					hover: "var(--color-stone-700)",
					active: "var(--color-stone-600)",
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
					DEFAULT: "var(--color-stone-900)",
					hover: "var(--color-stone-800)",
				},
				ring: "color-mix(in srgb, var(--color-orange-500) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
