import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-cyan-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-cyan-700)",
				active: "var(--color-cyan-800)",
			},
			accent: {
				DEFAULT: "var(--color-slate-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-slate-600)",
				active: "var(--color-slate-700)",
			},
			destructive: {
				DEFAULT: "var(--color-rose-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-rose-700)",
				active: "var(--color-rose-800)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-amber-600)",
				active: "var(--color-amber-700)",
			},
			success: {
				DEFAULT: "var(--color-teal-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-teal-700)",
				active: "var(--color-teal-800)",
			},
			info: {
				DEFAULT: "var(--color-cyan-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-cyan-600)",
				active: "var(--color-cyan-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-neutral-900)",
				},
				surface: {
					DEFAULT: "var(--color-neutral-200)",
					foreground: "var(--color-neutral-900)",
					hover: "var(--color-neutral-300)",
					active: "var(--color-neutral-400)",
				},
				"surface-1": {
					DEFAULT: "var(--color-neutral-300)",
					foreground: "var(--color-neutral-900)",
					hover: "var(--color-neutral-400)",
					active: "var(--color-neutral-500)",
				},
				muted: {
					DEFAULT: "var(--color-neutral-100)",
					foreground: "var(--color-neutral-500)",
					hover: "var(--color-neutral-200)",
					active: "var(--color-neutral-300)",
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
					DEFAULT: "var(--color-white)",
					hover: "var(--color-neutral-50)",
				},
				ring: "color-mix(in srgb, var(--color-cyan-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-cyan-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-cyan-400)",
				active: "var(--color-cyan-300)",
			},
			accent: {
				DEFAULT: "var(--color-slate-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-slate-300)",
				active: "var(--color-slate-200)",
			},
			destructive: {
				DEFAULT: "var(--color-rose-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-rose-400)",
				active: "var(--color-rose-300)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-amber-300)",
				active: "var(--color-amber-200)",
			},
			success: {
				DEFAULT: "var(--color-teal-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-teal-400)",
				active: "var(--color-teal-300)",
			},
			info: {
				DEFAULT: "var(--color-cyan-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-cyan-300)",
				active: "var(--color-cyan-200)",
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
				"surface-1": {
					DEFAULT: "var(--color-neutral-700)",
					foreground: "var(--color-neutral-100)",
					hover: "var(--color-neutral-600)",
					active: "var(--color-neutral-500)",
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
				ring: "color-mix(in srgb, var(--color-cyan-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
