import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-fuchsia-600)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-fuchsia-600)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-white)",
			},
			success: {
				DEFAULT: "var(--color-emerald-600)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-neutral-900)",
				},
				muted: {
					DEFAULT: "var(--color-neutral-100)",
					foreground: "var(--color-neutral-500)",
				},
				surface: {
					DEFAULT: "var(--color-neutral-200)",
					foreground: "var(--color-neutral-900)",
				},
				"surface-1": {
					DEFAULT: "var(--color-neutral-300)",
					foreground: "var(--color-neutral-900)",
				},
			},
			single: {
				foreground: "var(--color-neutral-900)",
				border: {
					DEFAULT: "var(--color-neutral-300)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-neutral-50)",
				},
				ring: "color-mix(in srgb, var(--color-fuchsia-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-fuchsia-500)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-emerald-400)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-fuchsia-500)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-neutral-900)",
					foreground: "var(--color-neutral-50)",
				},
				muted: {
					DEFAULT: "var(--color-neutral-800)",
					foreground: "var(--color-neutral-400)",
				},
				surface: {
					DEFAULT: "var(--color-neutral-700)",
					foreground: "var(--color-neutral-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-neutral-600)",
					foreground: "var(--color-neutral-200)",
				},
			},
			single: {
				foreground: "var(--color-neutral-50)",
				border: {
					DEFAULT: "var(--color-neutral-700)",
				},
				input: {
					DEFAULT: "var(--color-neutral-800)",
					hover: "var(--color-neutral-700)",
				},
				ring: "color-mix(in srgb, var(--color-fuchsia-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
