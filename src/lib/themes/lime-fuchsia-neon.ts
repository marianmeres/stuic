import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-lime-600)",
				foreground: "var(--color-black)",
				hover: "var(--color-lime-700)",
				active: "var(--color-lime-800)",
			},
			accent: {
				DEFAULT: "var(--color-fuchsia-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-fuchsia-600)",
				active: "var(--color-fuchsia-700)",
			},
			destructive: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-700)",
				active: "var(--color-red-800)",
			},
			warning: {
				DEFAULT: "var(--color-yellow-500)",
				foreground: "var(--color-black)",
				hover: "var(--color-yellow-600)",
				active: "var(--color-yellow-700)",
			},
			success: {
				DEFAULT: "var(--color-lime-600)",
				foreground: "var(--color-black)",
				hover: "var(--color-lime-700)",
				active: "var(--color-lime-800)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-zinc-100)",
					foreground: "var(--color-zinc-900)",
				},
				surface: {
					DEFAULT: "var(--color-zinc-200)",
					foreground: "var(--color-zinc-900)",
					hover: "var(--color-zinc-300)",
					active: "var(--color-zinc-400)",
				},
				"surface-1": {
					DEFAULT: "var(--color-zinc-300)",
					foreground: "var(--color-zinc-900)",
					hover: "var(--color-zinc-400)",
					active: "var(--color-zinc-500)",
				},
				muted: {
					DEFAULT: "var(--color-zinc-300)",
					foreground: "var(--color-zinc-500)",
					hover: "var(--color-zinc-400)",
					active: "var(--color-zinc-500)",
				},
			},
			single: {
				foreground: "var(--color-zinc-900)",
				border: {
					DEFAULT: "var(--color-zinc-300)",
					hover: "var(--color-zinc-400)",
					active: "var(--color-zinc-500)",
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
				hover: "var(--color-lime-300)",
				active: "var(--color-lime-200)",
			},
			accent: {
				DEFAULT: "var(--color-fuchsia-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-fuchsia-300)",
				active: "var(--color-fuchsia-200)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
			},
			warning: {
				DEFAULT: "var(--color-yellow-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-yellow-300)",
				active: "var(--color-yellow-200)",
			},
			success: {
				DEFAULT: "var(--color-lime-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-lime-300)",
				active: "var(--color-lime-200)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-zinc-950)",
					foreground: "var(--color-zinc-50)",
				},
				surface: {
					DEFAULT: "var(--color-zinc-900)",
					foreground: "var(--color-zinc-100)",
					hover: "var(--color-zinc-800)",
					active: "var(--color-zinc-700)",
				},
				"surface-1": {
					DEFAULT: "var(--color-zinc-800)",
					foreground: "var(--color-zinc-100)",
					hover: "var(--color-zinc-700)",
					active: "var(--color-zinc-600)",
				},
				muted: {
					DEFAULT: "var(--color-zinc-800)",
					foreground: "var(--color-zinc-500)",
					hover: "var(--color-zinc-700)",
					active: "var(--color-zinc-600)",
				},
			},
			single: {
				foreground: "var(--color-zinc-50)",
				border: {
					DEFAULT: "var(--color-zinc-700)",
					hover: "var(--color-zinc-600)",
					active: "var(--color-zinc-500)",
				},
				input: {
					DEFAULT: "var(--color-zinc-900)",
					hover: "var(--color-zinc-800)",
				},
				ring: "color-mix(in srgb, var(--color-lime-400) 30%, transparent)",
			},
		},
	},
};

export default { light, dark };
