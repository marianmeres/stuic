import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-lime-600)",
				foreground: "var(--color-black)",
			},
			accent: {
				DEFAULT: "var(--color-fuchsia-500)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-yellow-500)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-lime-600)",
				foreground: "var(--color-black)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-zinc-100)",
					foreground: "var(--color-zinc-900)",
				},
				muted: {
					DEFAULT: "var(--color-zinc-200)",
					foreground: "var(--color-zinc-500)",
				},
				surface: {
					DEFAULT: "var(--color-zinc-300)",
					foreground: "var(--color-zinc-900)",
				},
				"surface-1": {
					DEFAULT: "var(--color-zinc-400)",
					foreground: "var(--color-zinc-900)",
				},
			},
			single: {
				foreground: "var(--color-zinc-900)",
				border: {
					DEFAULT: "var(--color-zinc-300)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-zinc-100)",
				},
				ring: "color-mix(in srgb, var(--color-lime-500) 25%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-lime-400)",
				foreground: "var(--color-black)",
			},
			accent: {
				DEFAULT: "var(--color-fuchsia-400)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-yellow-400)",
				foreground: "var(--color-black)",
			},
			success: {
				DEFAULT: "var(--color-lime-400)",
				foreground: "var(--color-black)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-zinc-950)",
					foreground: "var(--color-zinc-50)",
				},
				muted: {
					DEFAULT: "var(--color-zinc-900)",
					foreground: "var(--color-zinc-500)",
				},
				surface: {
					DEFAULT: "var(--color-zinc-800)",
					foreground: "var(--color-zinc-400)",
				},
				"surface-1": {
					DEFAULT: "var(--color-zinc-700)",
					foreground: "var(--color-zinc-300)",
				},
			},
			single: {
				foreground: "var(--color-zinc-50)",
				border: {
					DEFAULT: "var(--color-zinc-700)",
				},
				input: {
					DEFAULT: "var(--color-zinc-950)",
					hover: "var(--color-zinc-900)",
				},
				ring: "color-mix(in srgb, var(--color-lime-400) 30%, transparent)",
			},
		},
	},
};

export default { light, dark };
