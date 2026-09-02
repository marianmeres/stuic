<!--
	SplitPane — two panes with one draggable separator between them. `horizontal` lays
	them side by side and resizes the primary pane's width, `vertical` stacks them and
	resizes its height; the other pane fills what is left.

	Built on the `resizable` attachment, which owns the pointer drag, the keyboard
	(arrows along the axis, Home / End, Enter to reset) and the ARIA window-splitter
	semantics of the separator. This component adds the layout, the theming,
	`bind:size` (a stored size wins over it on mount and is written back), `reset()`
	and the `t`-able accessible name.
-->
<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { ResizableInfo, ResizableUnits } from "../../attachments/resizable.js";
	import type { TranslateFn } from "../../types.js";

	export type SplitPaneOrientation = "horizontal" | "vertical";

	/** Which pane carries the size; the other one flexes into the rest. */
	export type SplitPanePrimary = "start" | "end";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Content of the first pane (left; top when vertical) */
		start?: Snippet;
		/** Content of the second pane (right; bottom when vertical) */
		end?: Snippet;
		/**
		 * `horizontal` (default) puts the panes side by side and resizes a width,
		 * `vertical` stacks them and resizes a height — the container then needs a
		 * definite height (`%` units resolve against it).
		 */
		orientation?: SplitPaneOrientation;
		/** Which pane the size applies to (the other one fills the rest). Default `start`. */
		primary?: SplitPanePrimary;
		/**
		 * Size of the primary pane in `units` (bindable). Default `50`. Written on every
		 * resize; writing it resizes the pane (clamped to `min` / `max`). A size stored
		 * under `key` wins over it on mount and is written back into the binding. The
		 * size the component mounted with is what double-click / Enter on the separator
		 * and `reset()` restore.
		 */
		size?: number;
		/** `%` (default) of the container, or `px`. Not meant to change after mount. */
		units?: ResizableUnits;
		/** Lower bound in `units`. `0` = none. */
		min?: number;
		/** Upper bound in `units`. `0` = none (`%` is still capped at 100). */
		max?: number;
		/** Keyboard step in `units` (Shift multiplies by 10). Default `1` for %, `10` for px. */
		step?: number;
		/** Persist the size under this key (`resizable-width-<key>` / `resizable-height-<key>`) */
		key?: string | number | null;
		/** Where `key` persists to. Default `session`. */
		storage?: "local" | "session";
		/** Renders the separator inert: no drag, no keyboard, not focusable */
		disabled?: boolean;
		/** Accessible name of the separator. Defaults to `t("resize")` — "Resize". */
		label?: string;
		/** Skip all default styling, use only custom classes */
		unstyled?: boolean;
		class?: string;
		/** Classes for the first pane */
		startClass?: string;
		/** Classes for the second pane */
		endClass?: string;
		/** Classes for the separator */
		separatorClass?: string;
		/** Bindable root element reference */
		el?: HTMLDivElement;
		/** Bindable separator element reference */
		separatorEl?: HTMLDivElement;
		/** Fires whenever a size is applied: on mount, while dragging, per key press, on reset, on `size` writes */
		onResize?: (info: ResizableInfo) => void;
		/** Translation function for the separator's default name (`resize`). English built in. */
		t?: TranslateFn;
	}
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { resizable, type ResizableApi } from "../../attachments/resizable.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./i18n.js";

	let {
		start,
		end,
		orientation = "horizontal",
		primary = "start",
		size = $bindable(50),
		units = "%",
		min = 0,
		max = 0,
		step,
		key,
		storage = "session",
		disabled = false,
		label,
		unstyled = false,
		class: classProp,
		startClass,
		endClass,
		separatorClass,
		el = $bindable(),
		separatorEl = $bindable(),
		onResize,
		t = t_default,
		...rest
	}: Props = $props();

	// The size the component mounted with (before a stored one applies): the reset target.
	const _initial = untrack(() => size);

	let _api = $state.raw<ResizableApi | undefined>();

	let _isX = $derived(orientation === "horizontal");

	// What the primary pane renders while the attachment is not active (`disabled`, or
	// before its first run). While it is active both write the very same string.
	let _sizeCss = $derived(`${size}${units}`);

	function _attachment(pane: SplitPanePrimary) {
		if (disabled || pane !== primary || !separatorEl) return undefined;
		return resizable({
			axis: _isX ? "x" : "y",
			// the current size, not the mount one: a re-setup (an option changed,
			// `disabled` toggled off) must not jump the pane
			initial: untrack(() => size),
			resetTo: _initial,
			min,
			max,
			units,
			step,
			key,
			storage,
			reverse: primary === "end",
			handle: separatorEl,
			label: label ?? t("resize"),
			onResize(info) {
				size = info.size;
				onResize?.(info);
			},
			onInit(api) {
				_api = api;
			},
		});
	}

	// Writes into `size` (a consumer's) go through the attachment, so they get clamped,
	// persisted and announced like a drag. Its own writes are already `current`.
	$effect(() => {
		const api = _api;
		const s = size;
		if (!api || s === api.current) return;
		untrack(() => api.set(s));
	});

	/** Restores the size the component mounted with. */
	export function reset() {
		if (_api) _api.reset();
		else size = _initial;
	}
</script>

<div
	bind:this={el}
	class={unstyled ? classProp : twMerge("stuic-split-pane", classProp)}
	data-orientation={orientation}
	data-disabled={disabled ? "" : undefined}
	{...rest}
>
	<div
		class={unstyled ? startClass : twMerge("stuic-split-pane-pane", startClass)}
		data-pane="start"
		data-primary={primary === "start" ? "" : undefined}
		style:width={_isX && primary === "start" ? _sizeCss : undefined}
		style:height={!_isX && primary === "start" ? _sizeCss : undefined}
		{@attach _attachment("start")}
	>
		{@render start?.()}
	</div>
	<div
		bind:this={separatorEl}
		class={unstyled
			? separatorClass
			: twMerge("stuic-split-pane-separator", separatorClass)}
		data-separator
		role="separator"
		aria-orientation={_isX ? "vertical" : "horizontal"}
	></div>
	<div
		class={unstyled ? endClass : twMerge("stuic-split-pane-pane", endClass)}
		data-pane="end"
		data-primary={primary === "end" ? "" : undefined}
		style:width={_isX && primary === "end" ? _sizeCss : undefined}
		style:height={!_isX && primary === "end" ? _sizeCss : undefined}
		{@attach _attachment("end")}
	>
		{@render end?.()}
	</div>
</div>
