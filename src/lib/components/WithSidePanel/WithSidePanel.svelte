<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ResizableWidthOptions } from "../../actions/resizable-width.svelte.js";

	export interface Props {
		/** Main content */
		children?: Snippet;
		/** Side panel content */
		side?: Snippet;
		/** Side panel position */
		position?: "left" | "right";
		/** Side panel width as CSS value (px or %) */
		width?: string;
		/** Container width (px) below which side auto-hides */
		threshold?: number;
		/** Enable slide transition */
		transition?: boolean;
		/** Transition duration in ms */
		transitionDuration?: number;
		/** Desktop visibility state (bindable) */
		open?: boolean;
		/** Enable drag-resizable side panel. Pass object for ResizableWidthOptions. */
		resizable?: boolean | Partial<ResizableWidthOptions>;
		/** Custom class for main content div */
		classMain?: string;
		/** Custom class for side panel div */
		classSide?: string;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Custom class for wrapper div */
		class?: string;
		/** Reactive current state (bindable) */
		current?: { open: boolean; small: boolean };
		/** Bindable reference to wrapper element */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { slide } from "svelte/transition";
	import { resizableWidth } from "../../actions/resizable-width.svelte.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { twMerge } from "../../utils/tw-merge.js";

	const prefersReduced = prefersReducedMotion();

	let {
		children,
		side,
		position = "left",
		width = $bindable("300px"),
		threshold = 768,
		transition = true,
		transitionDuration = 200,
		open = $bindable(true),
		resizable = false,
		classMain,
		classSide,
		unstyled = false,
		current = $bindable({ open: true, small: false }),
		class: classProp,
		el = $bindable(),
	}: Props = $props();

	// parent container width measurement
	let _parentWidth = $state(0);

	// mobile explicit open (separate from desktop `open`)
	let _mobileOpen = $state(false);

	let _isSmall = $derived(_parentWidth > 0 && _parentWidth < threshold);

	let _showSide = $derived(_isSmall ? _mobileOpen : open);

	let _sideWidth = $derived(_isSmall && _mobileOpen ? "100%" : width);

	let _duration = $derived(
		!transition || prefersReduced.current ? 0 : transitionDuration
	);

	let _isRight = $derived(position === "right");

	let _isResizable = $derived(!!resizable && !_isSmall);

	let _resizableOptions = $derived.by<Partial<ResizableWidthOptions>>(() => {
		if (typeof resizable === "object") return resizable;
		return {};
	});

	// Non-reactive width tracker for resizable mode.
	// Plain `let` (not $state) so reading it inside the action's fn() callback
	// does NOT register as a dependency of the action's $effect — preventing
	// teardown/rebuild of the drag session on every resize event.
	let _resizableWidth = width;

	// reset mobile state when leaving small mode
	$effect(() => {
		if (!_isSmall) _mobileOpen = false;
	});

	// exported API

	export function show() {
		if (_isSmall) _mobileOpen = true;
		else open = true;
	}

	export function hide() {
		if (_isSmall) _mobileOpen = false;
		else open = false;
	}

	export function toggle() {
		if (_isSmall) _mobileOpen = !_mobileOpen;
		else open = !open;
	}

	export function setWidth(w: string) {
		width = w;
		_resizableWidth = w;
	}

	// keep `current` prop in sync
	$effect(() => {
		current = { open: _showSide, small: _isSmall };
	});
</script>

<div
	bind:this={el}
	bind:offsetWidth={_parentWidth}
	class={twMerge(!unstyled && "stuic-with-side-panel", classProp)}
	data-position={!unstyled ? position : undefined}
	data-small={!unstyled && _isSmall ? "" : undefined}
	data-open={!unstyled && _showSide ? "" : undefined}
	style:flex-direction={_isRight ? "row-reverse" : "row"}
>
	{#if _showSide}
		<div
			class={twMerge(!unstyled && "stuic-with-side-panel-side", classSide)}
			style:width={_isResizable ? undefined : _sideWidth}
			style:min-width={_isResizable ? undefined : _sideWidth}
			transition:slide={{ axis: "x", duration: _duration }}
			use:resizableWidth={() => ({
				enabled: _isResizable,
				initial: parseInt(_resizableWidth) || 300,
				units: _resizableWidth.includes("%") ? "%" : "px",
				reverse: _isRight,
				..._resizableOptions,
				onResize(info) {
					const w = `${Math.round(info.width)}${info.units}`;
					_resizableWidth = w;
					width = w;
					_resizableOptions.onResize?.(info);
				},
			})}
		>
			<div class={!unstyled ? "stuic-with-side-panel-side-scroll" : undefined}>
				{@render side?.()}
			</div>
		</div>
	{/if}

	<div class={twMerge(!unstyled && "stuic-with-side-panel-main", classMain)}>
		{@render children?.()}
	</div>
</div>
