import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-zinc-800)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-zinc-500)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-rose-600)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-emerald-600)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-zinc-50)",
					foreground: "var(--color-zinc-900)",
				},
				muted: {
					DEFAULT: "var(--color-zinc-100)",
					foreground: "var(--color-zinc-500)",
				},
				surface: {
					DEFAULT: "var(--color-zinc-200)",
					foreground: "var(--color-zinc-900)",
				},
				"surface-1": {
					DEFAULT: "var(--color-zinc-300)",
					foreground: "var(--color-zinc-900)",
				},
			},
			single: {
				foreground: "var(--color-zinc-900)",
				border: {
					DEFAULT: "var(--color-zinc-300)",
				},
				input: {
					DEFAULT: "var(--color-zinc-50)",
					hover: "var(--color-zinc-100)",
				},
				ring: "color-mix(in srgb, var(--color-zinc-800) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-zinc-200)",
				foreground: "var(--color-black)",
			},
			accent: {
				DEFAULT: "var(--color-zinc-500)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-rose-500)",
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
					DEFAULT: "var(--color-zinc-900)",
					foreground: "var(--color-zinc-50)",
				},
				muted: {
					DEFAULT: "var(--color-zinc-800)",
					foreground: "var(--color-zinc-400)",
				},
				surface: {
					DEFAULT: "var(--color-zinc-700)",
					foreground: "var(--color-zinc-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-zinc-600)",
					foreground: "var(--color-zinc-200)",
				},
			},
			single: {
				foreground: "var(--color-zinc-50)",
				border: {
					DEFAULT: "var(--color-zinc-700)",
				},
				input: {
					DEFAULT: "var(--color-zinc-900)",
					hover: "var(--color-zinc-800)",
				},
				ring: "color-mix(in srgb, var(--color-zinc-200) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
