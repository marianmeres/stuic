<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { THC } from "../Thc/Thc.svelte";
	import type { FloatPlacement, FloatPoint } from "./float-utils.js";

	let _uid = 0;

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"title" | "draggable" | "class"
	> {
		/** Header title (rendered via `Thc`). Stays visible when minimized. */
		title?: THC;
		/** Initial left position in px. Overrides the `placement` x. */
		x?: number;
		/** Initial top position in px. Overrides the `placement` y. */
		y?: number;
		/** Initial placement preset, used for any axis `x`/`y` does not pin. */
		placement?: FloatPlacement;
		/** Edge gap (px) used when resolving `placement`. Number or `{x,y}`. */
		offset?: number | Partial<FloatPoint>;
		/** Panel width: a number (px) or any CSS length. Defaults to a token. */
		width?: number | string;
		/** Initial collapsed state. Runtime changes go through the methods below. */
		minimized?: boolean;
		/** Enable drag-repositioning by the header. Default `true`. */
		draggable?: boolean;
		/** Show the close `×` and enable `close()` / Escape. Default `false`. */
		closable?: boolean;
		/** Called by `close()`, the `×` button, and Escape (when closable). */
		onClose?: () => void;
		/** Close on Escape when `closable`. Default `true`. */
		closeOnEscape?: boolean;
		/** Raise above sibling Floats on pointerdown. Default `true`. */
		bringToFrontOnClick?: boolean;
		/**
		 * Opt-in persistence key. When set, `{x, y, minimized}` is remembered
		 * across reloads in localStorage under `stuic-float-<storageKey>`.
		 */
		storageKey?: string;
		/** Minimum gap kept from every viewport edge while clamping. Default `0`. */
		margin?: number;
		/** Accessible labels for the built-in buttons. */
		minimizeLabel?: string;
		restoreLabel?: string;
		closeLabel?: string;
		/** Leading header slot (e.g. a grip/icon). Drag still works over it. */
		icon?: Snippet;
		/** Header actions slot, placed left of the minimize/close buttons. */
		actions?: Snippet;
		/** Body content (hidden when minimized). */
		children?: Snippet;
		/** Root element classes (merged). */
		class?: string;
		classHeader?: string;
		classTitle?: string;
		classActions?: string;
		classBody?: string;
		/** Drop all default styling (still positioned/draggable). */
		unstyled?: boolean;
		/** Bindable root element reference. */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import { localStorageState } from "../../utils/persistent-state.svelte.js";
	import { draggable as draggableAction } from "../../actions/draggable.svelte.js";
	import { iconChevronDown, iconX } from "../../icons/index.js";
	import Thc, { isTHCNotEmpty } from "../Thc/Thc.svelte";
	import { clampToViewport, resolvePlacement, type FloatSize } from "./float-utils.js";
	import { nextFloatOrder } from "./float-stack.js";

	let {
		title,
		x: xProp,
		y: yProp,
		placement = "top-right",
		offset = 16,
		width,
		minimized: minimizedProp = false,
		draggable = true,
		closable = false,
		onClose,
		closeOnEscape = true,
		bringToFrontOnClick = true,
		storageKey,
		margin = 0,
		minimizeLabel = "Minimize",
		restoreLabel = "Restore",
		closeLabel = "Close",
		icon,
		actions,
		children,
		class: classProp,
		classHeader,
		classTitle,
		classActions,
		classBody,
		unstyled = false,
		el = $bindable(),
		...rest
	}: Props = $props();

	const titleId = `stuic-float-title-${_uid++}`;

	// reactive runtime state. `minimizedProp`/`storageKey` are initial-only by
	// design (runtime changes flow through the methods), so we capture them once.
	let x = $state(0);
	let y = $state(0);
	let minimized = $state(untrack(() => minimizedProp));
	let dragging = $state(false);
	let zOrder = $state(0);
	let initialized = $state(false);

	// optional persistence (created once; key is not expected to change)
	type Persisted = { x: number | null; y: number | null; minimized: boolean };
	const persist = untrack(() =>
		storageKey
			? localStorageState<Persisted>(`stuic-float-${storageKey}`, {
					x: null,
					y: null,
					minimized: minimizedProp,
				})
			: null
	);

	function viewport(): FloatSize {
		if (typeof window === "undefined") return { width: 0, height: 0 };
		return { width: window.innerWidth, height: window.innerHeight };
	}

	function currentSize(): FloatSize {
		return { width: el?.offsetWidth ?? 0, height: el?.offsetHeight ?? 0 };
	}

	// Persist imperatively (not via an $effect): an effect that writes persist.current
	// while the init effect reads it forms a reactive cycle, and it would also hit
	// localStorage on every pointermove. We save at meaningful end points instead.
	function persistNow() {
		if (persist) persist.current = { x, y, minimized };
	}

	// one-time position resolution (stored -> explicit x/y -> placement)
	$effect(() => {
		if (initialized || !el) return;

		// read the stored value once, untracked (no reactive dependency on it)
		const stored = persist ? untrack(() => persist.current) : undefined;
		if (stored && stored.x != null && stored.y != null) {
			x = stored.x;
			y = stored.y;
			if (typeof stored.minimized === "boolean") minimized = stored.minimized;
		} else {
			const base = resolvePlacement(placement, currentSize(), viewport(), offset);
			const next = clampToViewport(
				{ x: xProp ?? base.x, y: yProp ?? base.y },
				currentSize(),
				viewport(),
				margin
			);
			x = next.x;
			y = next.y;
		}

		zOrder = nextFloatOrder();
		initialized = true;
	});

	// keep inside the viewport on window resize
	$effect(() => {
		if (typeof window === "undefined") return;
		function onResize() {
			if (!initialized) return;
			const next = clampToViewport({ x, y }, currentSize(), viewport(), margin);
			x = next.x;
			y = next.y;
			persistNow();
		}
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	});

	// --- drag wiring -------------------------------------------------------------
	let dragStart = { x: 0, y: 0 };
	let lastDragMoved = false;

	function onDragStart() {
		dragStart = { x, y };
		dragging = true;
		lastDragMoved = false;
	}
	function onDragMove({ dx, dy }: { dx: number; dy: number }) {
		const next = clampToViewport(
			{ x: dragStart.x + dx, y: dragStart.y + dy },
			currentSize(),
			viewport(),
			margin
		);
		x = next.x;
		y = next.y;
	}
	function onDragEnd({ moved }: { moved: boolean }) {
		dragging = false;
		lastDragMoved = moved;
		if (moved) persistNow();
	}

	function onRootPointerDown() {
		if (bringToFrontOnClick) bringToFront();
	}

	function onHeaderDblClick(e: MouseEvent) {
		// ignore the dbl-click synthesized right after a real drag
		if (lastDragMoved) {
			lastDragMoved = false;
			return;
		}
		if ((e.target as Element)?.closest?.("[data-no-drag]")) return;
		toggleMinimize();
	}

	function onRootKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && closable && closeOnEscape) {
			e.stopPropagation();
			close();
		}
	}

	// --- imperative API (via bind:this) -----------------------------------------
	/** Move to an absolute `(x, y)` (clamped into the viewport). */
	export function moveTo(nx: number, ny: number) {
		const next = clampToViewport({ x: nx, y: ny }, currentSize(), viewport(), margin);
		x = next.x;
		y = next.y;
		persistNow();
	}
	/** Move to a named placement preset (optionally with a custom offset). */
	export function moveToPlacement(
		a: FloatPlacement,
		o: number | Partial<FloatPoint> = offset
	) {
		const p = resolvePlacement(a, currentSize(), viewport(), o);
		x = p.x;
		y = p.y;
		persistNow();
	}
	/** Current top-left position. */
	export function getPosition(): FloatPoint {
		return { x, y };
	}
	/** Collapse to the title bar. */
	export function minimize() {
		minimized = true;
		persistNow();
	}
	/** Expand the body. */
	export function expand() {
		minimized = false;
		persistNow();
	}
	/** Toggle minimized state. */
	export function toggleMinimize() {
		minimized = !minimized;
		persistNow();
	}
	/** Whether currently minimized. */
	export function isMinimized(): boolean {
		return minimized;
	}
	/** Fire `onClose` (consumer decides to unmount). */
	export function close() {
		onClose?.();
	}
	/** Raise above sibling Floats. */
	export function bringToFront() {
		zOrder = nextFloatOrder();
	}

	// --- derived presentation ----------------------------------------------------
	const cssWidth = $derived(
		width == null ? undefined : typeof width === "number" ? `${width}px` : width
	);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={el}
	{...rest}
	class={twMerge(unstyled ? "" : "stuic-float", classProp)}
	role="dialog"
	aria-modal="false"
	aria-labelledby={isTHCNotEmpty(title) ? titleId : undefined}
	data-minimized={minimized}
	data-dragging={dragging}
	data-draggable={draggable}
	style:left="{x}px"
	style:top="{y}px"
	style:width={cssWidth}
	style:visibility={initialized ? undefined : "hidden"}
	style:--stuic-float-z-order={zOrder}
	onpointerdown={onRootPointerDown}
	onkeydown={onRootKeydown}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={twMerge(unstyled ? "" : "stuic-float-header", classHeader)}
		ondblclick={onHeaderDblClick}
		use:draggableAction={() => ({
			enabled: draggable,
			ignore: "[data-no-drag]",
			onStart: onDragStart,
			onMove: onDragMove,
			onEnd: onDragEnd,
		})}
	>
		{#if icon}
			<span class={unstyled ? "" : "stuic-float-icon"}>{@render icon()}</span>
		{/if}

		<div id={titleId} class={twMerge(unstyled ? "" : "stuic-float-title", classTitle)}>
			{#if isTHCNotEmpty(title)}<Thc thc={title!} />{/if}
		</div>

		<div
			class={twMerge(unstyled ? "" : "stuic-float-actions", classActions)}
			data-no-drag
		>
			{#if actions}{@render actions()}{/if}

			<button
				type="button"
				class={unstyled ? "" : "stuic-float-btn"}
				data-no-drag
				aria-label={minimized ? restoreLabel : minimizeLabel}
				title={minimized ? restoreLabel : minimizeLabel}
				onclick={toggleMinimize}
			>
				<span class={unstyled ? "" : "stuic-float-chevron"}>
					{@html iconChevronDown({ size: 16 })}
				</span>
			</button>

			{#if closable}
				<button
					type="button"
					class={unstyled ? "" : "stuic-float-btn"}
					data-no-drag
					aria-label={closeLabel}
					title={closeLabel}
					onclick={() => close()}
				>
					{@html iconX({ size: 16 })}
				</button>
			{/if}
		</div>
	</div>

	<div class={unstyled ? "" : "stuic-float-body-wrap"}>
		<div class={unstyled ? "" : "stuic-float-body-inner"}>
			<div class={twMerge(unstyled ? "" : "stuic-float-body", classBody)}>
				{@render children?.()}
			</div>
		</div>
	</div>
</div>
