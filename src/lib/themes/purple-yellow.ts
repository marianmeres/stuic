import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-purple-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-purple-700)",
				active: "var(--color-purple-800)",
			},
			accent: {
				DEFAULT: "var(--color-yellow-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-yellow-500)",
				active: "var(--color-yellow-600)",
			},
			destructive: {
				DEFAULT: "var(--color-rose-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-rose-700)",
				active: "var(--color-rose-800)",
			},
			warning: {
				DEFAULT: "var(--color-yellow-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-yellow-500)",
				active: "var(--color-yellow-600)",
			},
			success: {
				DEFAULT: "var(--color-teal-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-teal-700)",
				active: "var(--color-teal-800)",
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
				ring: "color-mix(in srgb, var(--color-purple-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-purple-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-purple-400)",
				active: "var(--color-purple-300)",
			},
			accent: {
				DEFAULT: "var(--color-yellow-300)",
				foreground: "var(--color-black)",
				hover: "var(--color-yellow-200)",
				active: "var(--color-yellow-100)",
			},
			destructive: {
				DEFAULT: "var(--color-rose-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-rose-400)",
				active: "var(--color-rose-300)",
			},
			warning: {
				DEFAULT: "var(--color-yellow-300)",
				foreground: "var(--color-black)",
				hover: "var(--color-yellow-200)",
				active: "var(--color-yellow-100)",
			},
			success: {
				DEFAULT: "var(--color-teal-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-teal-400)",
				active: "var(--color-teal-300)",
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
				ring: "color-mix(in srgb, var(--color-purple-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
