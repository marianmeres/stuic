import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-700)",
				active: "var(--color-red-800)",
			},
			accent: {
				DEFAULT: "var(--color-sky-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-sky-500)",
				active: "var(--color-sky-600)",
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
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-gray-900)",
				},
				surface: {
					DEFAULT: "var(--color-gray-50)",
					foreground: "var(--color-gray-900)",
					hover: "var(--color-gray-100)",
					active: "var(--color-gray-200)",
				},
				"surface-1": {
					DEFAULT: "var(--color-gray-100)",
					foreground: "var(--color-gray-900)",
					hover: "var(--color-gray-200)",
					active: "var(--color-gray-300)",
				},
				"surface-2": {
					DEFAULT: "var(--color-gray-200)",
					foreground: "var(--color-gray-900)",
					hover: "var(--color-gray-300)",
					active: "var(--color-gray-400)",
				},
				muted: {
					DEFAULT: "var(--color-gray-100)",
					foreground: "var(--color-gray-500)",
					hover: "var(--color-gray-200)",
					active: "var(--color-gray-300)",
				},
			},
			single: {
				foreground: "var(--color-gray-900)",
				border: {
					DEFAULT: "var(--color-gray-200)",
					hover: "var(--color-gray-300)",
					active: "var(--color-gray-400)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-gray-50)",
				},
				ring: "color-mix(in srgb, var(--color-red-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
			},
			accent: {
				DEFAULT: "var(--color-sky-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-sky-300)",
				active: "var(--color-sky-200)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-white)",
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
				foreground: "var(--color-white)",
				hover: "var(--color-sky-300)",
				active: "var(--color-sky-200)",
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
				ring: "color-mix(in srgb, var(--color-red-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
