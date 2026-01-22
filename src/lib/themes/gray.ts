import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-gray-800)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-900)",
				active: "var(--color-gray-950)",
			},
			accent: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-600)",
				active: "var(--color-gray-700)",
			},
			destructive: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-600)",
				active: "var(--color-gray-700)",
			},
			warning: {
				DEFAULT: "var(--color-gray-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-gray-500)",
				active: "var(--color-gray-600)",
			},
			success: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-600)",
				active: "var(--color-gray-700)",
			},
			info: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-600)",
				active: "var(--color-gray-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-gray-50)",
					foreground: "var(--color-gray-900)",
				},
				surface: {
					DEFAULT: "var(--color-gray-100)",
					foreground: "var(--color-gray-900)",
					hover: "var(--color-gray-200)",
					active: "var(--color-gray-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-gray-200)",
					foreground: "var(--color-gray-900)",
					hover: "var(--color-gray-300)",
					active: "var(--color-gray-400)",
				},
				"surface-2": {
					DEFAULT: "var(--color-gray-300)",
					foreground: "var(--color-gray-900)",
					hover: "var(--color-gray-400)",
					active: "var(--color-gray-500)",
				},
				muted: {
					DEFAULT: "var(--color-gray-200)",
					foreground: "var(--color-gray-500)",
					hover: "var(--color-gray-300)",
					active: "var(--color-gray-400)",
				},
			},
			single: {
				foreground: "var(--color-gray-900)",
				border: {
					DEFAULT: "var(--color-gray-300)",
					hover: "var(--color-gray-400)",
					active: "var(--color-gray-500)",
				},
				input: {
					DEFAULT: "var(--color-gray-50)",
					hover: "var(--color-gray-100)",
				},
				ring: "color-mix(in srgb, var(--color-gray-800) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-gray-200)",
				foreground: "var(--color-black)",
				hover: "var(--color-gray-100)",
				active: "var(--color-gray-50)",
			},
			accent: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-400)",
				active: "var(--color-gray-300)",
			},
			destructive: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-400)",
				active: "var(--color-gray-300)",
			},
			warning: {
				DEFAULT: "var(--color-gray-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-gray-300)",
				active: "var(--color-gray-200)",
			},
			success: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-400)",
				active: "var(--color-gray-300)",
			},
			info: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-gray-400)",
				active: "var(--color-gray-300)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-gray-900)",
					foreground: "var(--color-gray-50)",
				},
				surface: {
					DEFAULT: "var(--color-gray-800)",
					foreground: "var(--color-gray-100)",
					hover: "var(--color-gray-700)",
					active: "var(--color-gray-600)",
				},
				"surface-1": {
					DEFAULT: "var(--color-gray-700)",
					foreground: "var(--color-gray-100)",
					hover: "var(--color-gray-600)",
					active: "var(--color-gray-500)",
				},
				"surface-2": {
					DEFAULT: "var(--color-gray-600)",
					foreground: "var(--color-gray-100)",
					hover: "var(--color-gray-500)",
					active: "var(--color-gray-400)",
				},
				muted: {
					DEFAULT: "var(--color-gray-700)",
					foreground: "var(--color-gray-400)",
					hover: "var(--color-gray-600)",
					active: "var(--color-gray-500)",
				},
			},
			single: {
				foreground: "var(--color-gray-50)",
				border: {
					DEFAULT: "var(--color-gray-700)",
					hover: "var(--color-gray-600)",
					active: "var(--color-gray-500)",
				},
				input: {
					DEFAULT: "var(--color-gray-800)",
					hover: "var(--color-gray-700)",
				},
				ring: "color-mix(in srgb, var(--color-gray-200) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
