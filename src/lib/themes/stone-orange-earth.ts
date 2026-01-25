import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-stone-700)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-800)",
				active: "var(--color-stone-900)",
			},
			accent: {
				DEFAULT: "var(--color-orange-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-orange-700)",
				active: "var(--color-orange-800)",
			},
			destructive: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-700)",
				active: "var(--color-red-800)",
			},
			warning: {
				DEFAULT: "var(--color-orange-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-orange-600)",
				active: "var(--color-orange-700)",
			},
			success: {
				DEFAULT: "var(--color-green-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-green-700)",
				active: "var(--color-green-800)",
			},
			info: {
				DEFAULT: "var(--color-sky-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-sky-700)",
				active: "var(--color-sky-800)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-stone-100)",
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
					DEFAULT: "var(--color-stone-300)",
					foreground: "var(--color-stone-500)",
					hover: "var(--color-stone-400)",
					active: "var(--color-stone-500)",
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
					DEFAULT: "var(--color-stone-50)",
					hover: "var(--color-stone-100)",
				},
				ring: "color-mix(in srgb, var(--color-stone-700) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-stone-400)",
				foreground: "var(--color-stone-950)",
				hover: "var(--color-stone-300)",
				active: "var(--color-stone-200)",
			},
			accent: {
				DEFAULT: "var(--color-orange-500)",
				foreground: "var(--color-black)",
				hover: "var(--color-orange-400)",
				active: "var(--color-orange-300)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
			},
			warning: {
				DEFAULT: "var(--color-orange-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-orange-300)",
				active: "var(--color-orange-200)",
			},
			success: {
				DEFAULT: "var(--color-green-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-green-400)",
				active: "var(--color-green-300)",
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
					foreground: "var(--color-stone-100)",
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
				foreground: "var(--color-stone-100)",
				border: {
					DEFAULT: "var(--color-stone-700)",
					hover: "var(--color-stone-600)",
					active: "var(--color-stone-500)",
				},
				input: {
					DEFAULT: "var(--color-stone-900)",
					hover: "var(--color-stone-800)",
				},
				ring: "color-mix(in srgb, var(--color-stone-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
