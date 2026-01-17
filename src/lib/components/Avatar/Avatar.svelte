<script lang="ts" module>
	export type IconFn = (opts?: { size?: number; class?: string }) => string;
	export type AvatarFallback = "icon" | "initials" | { icon: IconFn } | { initials: string };

	export interface Props {
		/** Photo URL - when provided, renders in photo mode */
		src?: string;
		/** Alt text for photo mode */
		alt?: string;
		/** String to extract initials from. Supports: "AB", "John Doe", or "john.doe@example.com" */
		initials?: string;
		/** Icon function to display - when provided alone, renders in icon mode */
		icon?: IconFn;
		/** Fallback when photo fails to load. Defaults to "icon" */
		fallback?: AvatarFallback;
		/** Optional string for color hash calculation (e.g., email, user ID). Falls back to `initials` */
		hashSource?: string;
		/** Size preset or custom Tailwind size class */
		size?: "sm" | "md" | "lg" | "xl" | string;
		/** Click handler - when provided, renders as a button */
		onclick?: (event: MouseEvent) => void;
		/** Background color (Tailwind class). Ignored if autoColor=true */
		bg?: string;
		/** Text color (Tailwind class). Ignored if autoColor=true */
		textColor?: string;
		/** Generate deterministic pastel colors from hashSource/initials */
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
	import { iconUser as defaultIconUser } from "../../icons/index.js";

	let {
		src,
		alt,
		initials: initialsProp,
		icon,
		fallback = "icon",
		hashSource,
		size = "md",
		onclick,
		bg,
		textColor,
		autoColor = false,
		class: classProp,
		el = $bindable(),
	}: Props = $props();

	const SIZE_PRESETS: Record<string, { container: string; icon: number }> = {
		sm: { container: "size-8 text-xs", icon: 16 },
		md: { container: "size-10 text-sm", icon: 20 },
		lg: { container: "size-14 text-base", icon: 28 },
		xl: { container: "size-16 text-lg", icon: 32 },
	};

	// Image loading state
	let imageError = $state(false);

	// Reset image state when src changes
	$effect(() => {
		if (src) {
			imageError = false;
		}
	});

	// Extract initials from string
	let extractedInitials = $derived.by(() => {
		let _input = (initialsProp || "").trim();

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

	// Determine the current render mode
	let renderMode = $derived.by((): "photo" | "initials" | "icon" => {
		// Photo mode (if src provided and no error)
		if (src && !imageError) return "photo";

		// Photo error - determine fallback
		if (src && imageError) {
			if (fallback === "initials") return "initials";
			if (typeof fallback === "object" && "initials" in fallback) return "initials";
			return "icon";
		}

		// No src - determine from other props
		if (initialsProp) return "initials";
		return "icon";
	});

	// Get fallback initials (from fallback prop or initialsProp)
	let fallbackInitials = $derived.by(() => {
		if (typeof fallback === "object" && "initials" in fallback) {
			const _input = (fallback.initials || "").trim();
			if (!_input) return "?";

			// Apply same extraction logic
			let result = _input;
			if (_input.includes("@")) {
				const username = _input.split("@")[0];
				const parts = username.split(/[._+-]/).filter(Boolean);
				if (parts.length > 1) {
					result = parts.map((p) => p.charAt(0)).join("");
				} else {
					result = username;
				}
			} else if (_input.length > 2 && /\s/.test(_input)) {
				result = _input
					.split(/\s/)
					.map((v) => v.trim())
					.filter(Boolean)
					.map((v) => v.charAt(0))
					.join("");
			}
			return result.slice(0, 2).toUpperCase();
		}
		return extractedInitials;
	});

	// Get the icon to render
	let iconToRender = $derived.by(() => {
		// If fallback specifies a custom icon
		if (imageError && typeof fallback === "object" && "icon" in fallback) {
			return fallback.icon;
		}
		// Use provided icon or default
		return icon || defaultIconUser;
	});

	// Get icon size based on preset or custom size
	let iconSize = $derived.by(() => {
		const preset = SIZE_PRESETS[size];
		if (preset) return preset.icon;

		// For custom sizes, try to parse size-N pattern
		const match = size?.match(/size-(\d+)/);
		if (match) {
			// size-N = N * 4px, icon should be ~50%
			return parseInt(match[1]) * 2;
		}

		return 20; // Default fallback
	});

	let colors = $derived(
		autoColor ? generateAvatarColors(hashSource || initialsProp || "") : null
	);

	let sizeClass = $derived(SIZE_PRESETS[size]?.container || size);

	let style = $derived(
		autoColor && colors
			? `background-color: ${colors.bg}; color: ${colors.text};`
			: undefined
	);

	let baseClass = $derived(
		twMerge(
			"stuic-avatar",
			"inline-flex items-center justify-center",
			"rounded-full font-medium shrink-0 overflow-hidden",
			!autoColor &&
				"bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
			sizeClass,
			!autoColor && bg,
			!autoColor && textColor,
			onclick && "select-none cursor-pointer",
			classProp
		)
	);

	function handleImageError() {
		imageError = true;
	}
</script>

{#if onclick}
	<button bind:this={el} type="button" class={baseClass} {style} {onclick}>
		{#if renderMode === "photo"}
			<img
				{src}
				{alt}
				class="size-full object-cover"
				onerror={handleImageError}
			/>
		{:else if renderMode === "initials"}
			{fallbackInitials}
		{:else}
			{@html iconToRender({ size: iconSize })}
		{/if}
	</button>
{:else}
	<div bind:this={el} class={baseClass} {style}>
		{#if renderMode === "photo"}
			<img
				{src}
				{alt}
				class="size-full object-cover"
				onerror={handleImageError}
			/>
		{:else if renderMode === "initials"}
			{fallbackInitials}
		{:else}
			{@html iconToRender({ size: iconSize })}
		{/if}
	</div>
{/if}
