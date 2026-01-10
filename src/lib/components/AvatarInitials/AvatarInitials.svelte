<script lang="ts" module>
	export interface Props {
		/** String to extract initials from. Supports: "AB", "John Doe", or "john.doe@example.com" */
		input: string;
		/** Optional string for color hash calculation (e.g., email, user ID). Falls back to `input` */
		hashSource?: string;
		/** Size preset or custom Tailwind size class */
		size?: "sm" | "md" | "lg" | "xl" | string;
		/** Click handler - when provided, renders as a button */
		onclick?: (event: MouseEvent) => void;
		/** Background color (Tailwind class). Ignored if autoColor=true */
		bg?: string;
		/** Text color (Tailwind class). Ignored if autoColor=true */
		textColor?: string;
		/** Generate deterministic pastel colors from hashSource/input */
		autoColor?: boolean;
		/** CSS class override */
		class?: string;
		/** Bindable element reference */
		el?: HTMLDivElement | HTMLButtonElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { generateAvatarColors } from "../../utils/avatar-colors.js";

	let {
		input,
		hashSource,
		size = "md",
		onclick,
		bg,
		textColor,
		autoColor = false,
		class: classProp,
		el = $bindable(),
	}: Props = $props();

	const SIZE_PRESETS: Record<string, string> = {
		sm: "size-8 text-xs",
		md: "size-10 text-sm",
		lg: "size-14 text-base",
		xl: "size-16 text-lg",
	};

	let initials = $derived.by(() => {
		let _input = (input || "").trim();

		if (!_input) return "?";

		// Check if input looks like an email
		if (_input.includes("@")) {
			const username = _input.split("@")[0];
			// Split by common separators (., _, -)
			const parts = username.split(/[._+-]/).filter(Boolean);
			if (parts.length > 1) {
				_input = parts.map((p) => p.charAt(0)).join("");
			} else {
				_input = username;
			}
		}
		// Check if input looks like a full name (multiple words)
		else if (_input.length > 2 && /\s/.test(_input)) {
			_input = _input
				.split(/\s/)
				.map((v) => v.trim())
				.filter(Boolean)
				.map((v) => v.charAt(0))
				.join("");
		}

		// Extract first 2 chars, uppercase
		return _input.slice(0, 2).toUpperCase();
	});

	let colors = $derived(
		autoColor ? generateAvatarColors(hashSource || input || "") : null
	);

	let sizeClass = $derived(SIZE_PRESETS[size] || size);

	let style = $derived(
		autoColor && colors
			? `background-color: ${colors.bg}; color: ${colors.text};`
			: undefined
	);

	let baseClass = $derived(
		twMerge(
			"stuic-avatar-initials",
			"inline-flex items-center justify-center",
			"rounded-full font-medium shrink-0",
			!autoColor &&
				"bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
			sizeClass,
			!autoColor && bg,
			!autoColor && textColor,
			onclick && "select-none cursor-pointer",
			classProp
		)
	);
</script>

{#if onclick}
	<button bind:this={el} type="button" class={baseClass} {style} {onclick}>
		{initials}
	</button>
{:else}
	<div bind:this={el} class={baseClass} {style}>
		{initials}
	</div>
{/if}
