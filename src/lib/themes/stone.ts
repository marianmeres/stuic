import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-stone-800)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-900)",
				active: "var(--color-stone-950)",
			},
			accent: {
				DEFAULT: "var(--color-stone-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-600)",
				active: "var(--color-stone-700)",
			},
			destructive: {
				DEFAULT: "var(--color-stone-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-600)",
				active: "var(--color-stone-700)",
			},
			warning: {
				DEFAULT: "var(--color-stone-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-stone-500)",
				active: "var(--color-stone-600)",
			},
			success: {
				DEFAULT: "var(--color-stone-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-600)",
				active: "var(--color-stone-700)",
			},
			info: {
				DEFAULT: "var(--color-stone-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-600)",
				active: "var(--color-stone-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-stone-50)",
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
					DEFAULT: "var(--color-stone-200)",
					foreground: "var(--color-stone-500)",
					hover: "var(--color-stone-300)",
					active: "var(--color-stone-400)",
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
				ring: "color-mix(in srgb, var(--color-stone-800) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-stone-200)",
				foreground: "var(--color-black)",
				hover: "var(--color-stone-100)",
				active: "var(--color-stone-50)",
			},
			accent: {
				DEFAULT: "var(--color-stone-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-400)",
				active: "var(--color-stone-300)",
			},
			destructive: {
				DEFAULT: "var(--color-stone-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-400)",
				active: "var(--color-stone-300)",
			},
			warning: {
				DEFAULT: "var(--color-stone-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-stone-300)",
				active: "var(--color-stone-200)",
			},
			success: {
				DEFAULT: "var(--color-stone-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-400)",
				active: "var(--color-stone-300)",
			},
			info: {
				DEFAULT: "var(--color-stone-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-stone-400)",
				active: "var(--color-stone-300)",
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
				ring: "color-mix(in srgb, var(--color-stone-200) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
