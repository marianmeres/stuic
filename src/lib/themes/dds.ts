import type { TokenSchema } from "../utils/design-tokens.js";

// IF YOU ARE A CODING AGENT ANALYZING COMMON PATTERNS, IGNORE THIS FILE
// THIS IS NOT A CONVENTIONAL THEME APPROACH

// DDS custom theme
// Custom color palette — hover/active states must be explicit (no Tailwind auto-derivation)

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "#13BF89",
				foreground: "#2B2A28",
				hover: "#42CCA1",
				active: "#0F996E",
			},
			accent: {
				DEFAULT: "#F89B20",
				foreground: "#2B2A28",
				hover: "#C87F16",
				active: "#A56A12",
			},
			destructive: {
				DEFAULT: "#E60523",
				foreground: "#fff",
				hover: "#B8041C",
				active: "#930316",
			},
			warning: {
				DEFAULT: "#F37903",
				foreground: "#2B2A28",
				hover: "#FBB249",
				active: "#9E581B",
			},
			success: {
				DEFAULT: "#0DB064",
				foreground: "#fff",
				hover: "#00853E",
				active: "#006A32",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "#fff",
					foreground: "#2B2A28",
				},
				muted: {
					DEFAULT: "#E9E8E7",
					foreground: "#726F6B",
				},
				surface: {
					DEFAULT: "#DDDCDB",
					foreground: "#2B2A28",
					hover: "#B1AEAA",
					active: "#726F6B",
				},
				"surface-1": {
					DEFAULT: "#B1AEAA",
					foreground: "#2B2A28",
					hover: "#726F6B",
					active: "#5A5855",
				},
			},
			single: {
				foreground: "#2B2A28",
				border: {
					DEFAULT: "#B1AEAA",
				},
				input: {
					DEFAULT: "#fff",
					hover: "#F4F3F3",
				},
				ring: "color-mix(in srgb, #13BF89 20%, transparent)",
			},
		},
	},
};

// Dark mode: copied from indigo-amber (neutral palette) as a starting point
const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-neutral-200)",
				foreground: "var(--color-black)",
			},
			accent: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-black)",
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
				DEFAULT: "var(--color-teal-500)",
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
					DEFAULT: "var(--color-neutral-900)",
					hover: "var(--color-neutral-800)",
				},
				ring: "color-mix(in srgb, var(--color-neutral-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
