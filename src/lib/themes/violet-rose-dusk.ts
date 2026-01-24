import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-violet-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-violet-700)",
				active: "var(--color-violet-800)",
			},
			accent: {
				DEFAULT: "var(--color-rose-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-rose-600)",
				active: "var(--color-rose-700)",
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
					DEFAULT: "var(--color-zinc-50)",
					foreground: "var(--color-zinc-900)",
				},
				surface: {
					DEFAULT: "var(--color-zinc-100)",
					foreground: "var(--color-zinc-900)",
					hover: "var(--color-zinc-200)",
					active: "var(--color-zinc-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-zinc-200)",
					foreground: "var(--color-zinc-900)",
					hover: "var(--color-zinc-300)",
					active: "var(--color-zinc-400)",
				},
				"surface-2": {
					DEFAULT: "var(--color-zinc-300)",
					foreground: "var(--color-zinc-900)",
					hover: "var(--color-zinc-400)",
					active: "var(--color-zinc-500)",
				},
				muted: {
					DEFAULT: "var(--color-zinc-200)",
					foreground: "var(--color-zinc-500)",
					hover: "var(--color-zinc-300)",
					active: "var(--color-zinc-400)",
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
					hover: "var(--color-zinc-50)",
				},
				ring: "color-mix(in srgb, var(--color-violet-500) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-violet-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-violet-300)",
				active: "var(--color-violet-200)",
			},
			accent: {
				DEFAULT: "var(--color-rose-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-rose-300)",
				active: "var(--color-rose-200)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-black)",
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
				foreground: "var(--color-black)",
				hover: "var(--color-sky-300)",
				active: "var(--color-sky-200)",
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
				"surface-2": {
					DEFAULT: "var(--color-zinc-700)",
					foreground: "var(--color-zinc-100)",
					hover: "var(--color-zinc-600)",
					active: "var(--color-zinc-500)",
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
				ring: "color-mix(in srgb, var(--color-violet-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
