import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-gray-800)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-gray-400)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-gray-50)",
					foreground: "var(--color-gray-900)",
				},
				muted: {
					DEFAULT: "var(--color-gray-100)",
					foreground: "var(--color-gray-500)",
				},
				surface: {
					DEFAULT: "var(--color-gray-200)",
					foreground: "var(--color-gray-900)",
				},
				"surface-1": {
					DEFAULT: "var(--color-gray-300)",
					foreground: "var(--color-gray-900)",
				},
			},
			single: {
				foreground: "var(--color-gray-900)",
				border: {
					DEFAULT: "var(--color-gray-300)",
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
			},
			accent: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-gray-400)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-gray-500)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-gray-900)",
					foreground: "var(--color-gray-50)",
				},
				muted: {
					DEFAULT: "var(--color-gray-800)",
					foreground: "var(--color-gray-400)",
				},
				surface: {
					DEFAULT: "var(--color-gray-700)",
					foreground: "var(--color-gray-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-gray-600)",
					foreground: "var(--color-gray-200)",
				},
			},
			single: {
				foreground: "var(--color-gray-50)",
				border: {
					DEFAULT: "var(--color-gray-700)",
				},
				input: {
					DEFAULT: "var(--color-gray-900)",
					hover: "var(--color-gray-800)",
				},
				ring: "color-mix(in srgb, var(--color-gray-200) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
