<script lang="ts" module>
	export type IconFn = (opts?: { size?: number; class?: string }) => string;
	export type AvatarFallback =
		| "icon"
		| "initials"
		| { icon: IconFn }
		| { initials: string };

	export interface Props {
		/** Photo URL - when provided, renders in photo mode */
		src?: string;
		/** Alt text for photo mode */
		alt?: string;
		/** String to extract initials from. Supports: "AB", "John Doe", or "john.doe@example.com" */
		initials?: string;
		/** optional length */
		initialsLength?: number;
		/** Icon function to display - when provided alone, renders in icon mode */
		icon?: IconFn;
		/** Fallback when photo fails to load. Defaults to "icon" */
		fallback?: AvatarFallback;
		/** Optional string for color hash calculation (e.g., email, user ID). Falls back to `initials` */
		hashSource?: string;
		/** Size preset or custom Tailwind size class */
		size?: "sm" | "md" | "lg" | "xl" | "2xl" | string;
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
		initialsLength = 2,
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

	const DEFAULT_ICON_SIZE = 24;

	// Icon sizes for preset sizes (visual sizes are handled by CSS)
	const ICON_SIZES: Record<string, number> = {
		sm: 16,
		md: DEFAULT_ICON_SIZE,
		lg: 28,
		xl: 32,
		"2xl": 36,
	};

	// Check if size is a known preset
	const isPresetSize = (s: string): s is "sm" | "md" | "lg" | "xl" | "2xl" =>
		s in ICON_SIZES;

	// Extract initials from input string (email, name, or raw initials)
	function extractInitials(input: string, length: number): string {
		let _input = (input || "").trim();
		if (!_input) return "?";

		// Email handling
		if (_input.includes("@")) {
			const username = _input.split("@")[0];
			const parts = username.split(/[._+-]/).filter(Boolean);
			if (parts.length > 1) {
				_input = parts.map((p) => p.charAt(0)).join("");
			} else {
				_input = username;
			}
		}
		// Full name handling
		else if (_input.length > length && /\s/.test(_input)) {
			_input = _input
				.split(/\s/)
				.map((v) => v.trim())
				.filter(Boolean)
				.map((v) => v.charAt(0))
				.join("");
		}

		return _input.slice(0, length).toUpperCase();
	}

	// Image loading state
	let imageError = $state(false);

	// Reset image state when src changes
	$effect(() => {
		if (src) {
			imageError = false;
		}
	});

	let extractedInitials = $derived(extractInitials(initialsProp || "", initialsLength));

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
			return extractInitials(fallback.initials || "", initialsLength);
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
		if (isPresetSize(size)) return ICON_SIZES[size];

		// For custom sizes, try to parse size-N pattern
		const match = size?.match(/size-(\d+)/);
		if (match) {
			// size-N = N * 4px, icon should be ~50%
			return parseInt(match[1]) * 2;
		}

		return DEFAULT_ICON_SIZE; // Default fallback
	});

	let colors = $derived(
		autoColor ? generateAvatarColors(hashSource || initialsProp || "") : null
	);

	let style = $derived(
		autoColor && colors
			? `background-color: ${colors.bg}; color: ${colors.text};`
			: undefined
	);

	// Build class string - base class for CSS targeting, allow user overrides via classProp
	let baseClass = $derived(
		twMerge(
			"stuic-avatar",
			// Custom size classes when not using preset (preset sizes handled by data-size in CSS)
			!isPresetSize(size) && size,
			// User-provided Tailwind overrides for colors (only when not using autoColor)
			!autoColor && bg,
			!autoColor && textColor,
			classProp
		)
	);

	function handleImageError() {
		imageError = true;
	}
</script>

{#if onclick}
	<button
		bind:this={el}
		type="button"
		class={baseClass}
		{style}
		{onclick}
		data-size={isPresetSize(size) ? size : undefined}
		data-interactive="true"
	>
		{#if renderMode === "photo"}
			<img {src} {alt} class="size-full object-cover" onerror={handleImageError} />
		{:else if renderMode === "initials"}
			{fallbackInitials}
		{:else}
			{@html iconToRender({ size: iconSize })}
		{/if}
	</button>
{:else}
	<div
		bind:this={el}
		class={baseClass}
		{style}
		data-size={isPresetSize(size) ? size : undefined}
	>
		{#if renderMode === "photo"}
			<img {src} {alt} class="size-full object-cover" onerror={handleImageError} />
		{:else if renderMode === "initials"}
			{fallbackInitials}
		{:else}
			{@html iconToRender({ size: iconSize })}
		{/if}
	</div>
{/if}
