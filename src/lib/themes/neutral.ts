import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-neutral-800)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-900)",
				active: "var(--color-neutral-950)",
			},
			accent: {
				DEFAULT: "var(--color-neutral-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-600)",
				active: "var(--color-neutral-700)",
			},
			destructive: {
				DEFAULT: "var(--color-neutral-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-600)",
				active: "var(--color-neutral-700)",
			},
			warning: {
				DEFAULT: "var(--color-neutral-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-neutral-500)",
				active: "var(--color-neutral-600)",
			},
			success: {
				DEFAULT: "var(--color-neutral-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-600)",
				active: "var(--color-neutral-700)",
			},
			info: {
				DEFAULT: "var(--color-neutral-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-600)",
				active: "var(--color-neutral-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-neutral-50)",
					foreground: "var(--color-neutral-900)",
				},
				surface: {
					DEFAULT: "var(--color-neutral-100)",
					foreground: "var(--color-neutral-900)",
					hover: "var(--color-neutral-200)",
					active: "var(--color-neutral-300)",
				},
				muted: {
					DEFAULT: "var(--color-neutral-200)",
					foreground: "var(--color-neutral-500)",
					hover: "var(--color-neutral-300)",
					active: "var(--color-neutral-400)",
				},
			},
			single: {
				foreground: "var(--color-neutral-900)",
				border: {
					DEFAULT: "var(--color-neutral-300)",
					hover: "var(--color-neutral-400)",
					active: "var(--color-neutral-500)",
				},
				input: {
					DEFAULT: "var(--color-neutral-50)",
					hover: "var(--color-neutral-100)",
				},
				ring: "color-mix(in srgb, var(--color-neutral-800) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-neutral-200)",
				foreground: "var(--color-black)",
				hover: "var(--color-neutral-100)",
				active: "var(--color-neutral-50)",
			},
			accent: {
				DEFAULT: "var(--color-neutral-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-400)",
				active: "var(--color-neutral-300)",
			},
			destructive: {
				DEFAULT: "var(--color-neutral-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-400)",
				active: "var(--color-neutral-300)",
			},
			warning: {
				DEFAULT: "var(--color-neutral-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-neutral-300)",
				active: "var(--color-neutral-200)",
			},
			success: {
				DEFAULT: "var(--color-neutral-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-400)",
				active: "var(--color-neutral-300)",
			},
			info: {
				DEFAULT: "var(--color-neutral-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-neutral-400)",
				active: "var(--color-neutral-300)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-neutral-900)",
					foreground: "var(--color-neutral-50)",
				},
				surface: {
					DEFAULT: "var(--color-neutral-800)",
					foreground: "var(--color-neutral-100)",
					hover: "var(--color-neutral-700)",
					active: "var(--color-neutral-600)",
				},
				muted: {
					DEFAULT: "var(--color-neutral-700)",
					foreground: "var(--color-neutral-400)",
					hover: "var(--color-neutral-600)",
					active: "var(--color-neutral-500)",
				},
			},
			single: {
				foreground: "var(--color-neutral-50)",
				border: {
					DEFAULT: "var(--color-neutral-700)",
					hover: "var(--color-neutral-600)",
					active: "var(--color-neutral-500)",
				},
				input: {
					DEFAULT: "var(--color-neutral-800)",
					hover: "var(--color-neutral-700)",
				},
				ring: "color-mix(in srgb, var(--color-neutral-200) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
