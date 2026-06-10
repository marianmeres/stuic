<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { WheelPickerOption, WheelPickerOptionInput } from "./utils.js";

	export type { WheelPickerOption, WheelPickerOptionInput } from "./utils.js";

	export interface Props<T = string | number> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "onchange"
	> {
		/** Options to scroll through. Bare strings/numbers become `{ label, value }`; objects pass through. */
		options: WheelPickerOptionInput<T>[];

		/** Bindable selected value (the chosen option's `value`). Primary binding. */
		value?: T;

		/** Bindable selected real index (modulo-reduced). Alternative/companion to `value`. */
		index?: number;

		/** Infinite wrap (59 → 00). Default false (single copy, clamped at the ends). */
		loop?: boolean;

		/** Row height in px. Prefer an integer to avoid cross-copy drift. Default 36. */
		itemHeight?: number;

		/** How many rows are visible (forced odd, so there's an exact center). Default 5. */
		visibleCount?: number;

		/** Loop buffer copies (floor; auto-grown to guarantee fling runway). Default 3. */
		tiles?: number;

		/** Enable keyboard navigation (Arrow/Page/Home/End). Default true. */
		keyboard?: boolean;

		/** Announce the committed label via an aria-live region. Default true. */
		announce?: boolean;

		/** Accessible name for the listbox. Strongly recommended. */
		label?: string;

		/** Fired when the selection settles on a new option (not during a fling). */
		onchange?: (option: WheelPickerOption<T>, index: number) => void;

		/** Skip default styling. */
		unstyled?: boolean;
		/** Additional CSS classes on the root. */
		class?: string;
		/** Extra classes on each row. */
		classItem?: string;
		/** Extra classes on the selected row. */
		classItemSelected?: string;
		/** Extra classes on the center selection band. */
		classBand?: string;
		/** Bindable root element ref. */
		el?: HTMLDivElement;
		/** Custom row renderer (alternative to the plain label). */
		renderItem?: Snippet<
			[{ option: WheelPickerOption<T>; index: number; selected: boolean }]
		>;
	}

	// Per-instance id base for aria wiring (option ids / activedescendant).
	let _uid = 0;
</script>

<script lang="ts" generics="T = string | number">
	import { untrack } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import {
		normalizeOptions,
		forceOdd,
		clamp,
		mod,
		centerGlobalIndex,
		realIndexFromGlobal,
		resolveTiles,
		homeBase,
		driftTiles,
		nextEnabledIndex,
		indexOfValue,
		nearestGlobalIndex,
	} from "./utils.js";

	let {
		options,
		value = $bindable(),
		index = $bindable(),
		loop = false,
		itemHeight = 36,
		visibleCount = 5,
		tiles: tilesProp = 3,
		keyboard = true,
		announce = true,
		label,
		onchange,
		unstyled = false,
		class: classProp,
		classItem,
		classItemSelected,
		classBand,
		el = $bindable(),
		renderItem,
		// pulled out of `rest` so they name the listbox (the semantic control), not the wrapper
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		...rest
	}: Props<T> = $props();

	const instanceId = `stuic-wp-${_uid++}`;
	const optionId = (realIndex: number) => `${instanceId}-opt-${realIndex}`;

	const reducedMotion = prefersReducedMotion();

	// 120ms of scroll silence ≈ at rest. The PRIMARY commit path: `scrollend` is
	// absent on iOS Safari < 26.2, so we never depend on it (we also listen for it
	// as a crisp optimization when available).
	const IDLE_MS = 120;

	// ---- derived geometry (fully deterministic from props — no measurement) ----
	const opts = $derived(normalizeOptions<T>(options));
	const n = $derived(opts.length);
	const vCount = $derived(forceOdd(visibleCount));
	const centerPad = $derived(((vCount - 1) / 2) * itemHeight);
	const containerH = $derived(vCount * itemHeight);
	const tiles = $derived(resolveTiles(tilesProp, n, itemHeight, containerH, loop));
	const tilePx = $derived(n * itemHeight);
	const homeTile = $derived(Math.floor(tiles / 2));
	const homeBaseVal = $derived(homeBase(tiles, n));

	// Rendered rows: `tiles` copies when looping, one otherwise. Only the home tile
	// carries the real listbox semantics; every other copy is aria-hidden so screen
	// readers never encounter N duplicates of each value.
	const rows = $derived.by(() => {
		const out: {
			gi: number;
			realIndex: number;
			isHome: boolean;
			option: WheelPickerOption<T>;
		}[] = [];
		const total = tiles * n;
		for (let gi = 0; gi < total; gi++) {
			const realIndex = ((gi % n) + n) % n;
			out.push({
				gi,
				realIndex,
				isHome: loop ? Math.floor(gi / n) === homeTile : true,
				option: opts[realIndex],
			});
		}
		return out;
	});

	// committed selection (initialized once from value/index)
	function initialIndex(): number {
		const o = normalizeOptions<T>(options);
		if (o.length === 0) return 0;
		if (value !== undefined) {
			const i = indexOfValue(o, value);
			if (i >= 0) return i;
		}
		if (index !== undefined && index >= 0) return Math.min(index, o.length - 1);
		return 0;
	}
	let selectedIndex = $state(initialIndex());

	let scrollEl: HTMLDivElement | undefined = $state();
	let announceText = $state("");
	// Flipped each announce so the live-region text always differs (forces a re-announce
	// even when two consecutive selections share the same label).
	let announceNonce = false;

	// True while the USER is actively interacting (pointer/touch/wheel) until the next
	// settle — used to defer external `value` changes so we never yank the wheel out from
	// under a drag. Driven by INPUT events (not scroll events), so our own programmatic
	// scrolls (init/teleport/keyboard/value-set) never spuriously trip it.
	let userScrolling = false;
	// A smooth programmatic scroll is animating; coalesces rapid value changes to instant.
	let pendingSmooth = false;
	let idleTimer: ReturnType<typeof setTimeout> | undefined;
	let lastScrollTop = 0;
	let lastDir: 1 | -1 = 1;
	// $state so the reconcile effect re-runs when mount flips it (cheap early-return),
	// instead of depending on effect source-order.
	let mounted = $state(false);

	const selectedOptionId = $derived(n > 0 ? optionId(selectedIndex) : undefined);

	// Genuine user intent to scroll. armIdle() guarantees a settle() that clears the flag
	// even for a tap/click that doesn't actually move the scroll position.
	function markUserScrolling() {
		userScrolling = true;
		armIdle();
	}

	/** Position scrollTop so `realIndex` sits centered (instant). */
	function anchorTo(realIndex: number) {
		if (!scrollEl || n === 0) return;
		const gi = loop ? homeBaseVal + realIndex : realIndex;
		scrollEl.scrollTop = gi * itemHeight;
		lastScrollTop = scrollEl.scrollTop;
	}

	/** Commit a new real index outward (value/index/onchange/announce). No-op if unchanged. */
	function commit(realIndex: number) {
		const opt = opts[realIndex];
		if (!opt) return;
		const changed = realIndex !== selectedIndex || value !== opt.value;
		selectedIndex = realIndex;
		index = realIndex;
		value = opt.value;
		if (changed) {
			if (announce) {
				announceNonce = !announceNonce;
				// trailing zero-width space on alternate commits => text always changes
				announceText = announceNonce ? opt.label : opt.label + "\u200B";
			}
			onchange?.(opt, realIndex);
		}
	}

	function armIdle() {
		clearTimeout(idleTimer);
		idleTimer = setTimeout(settle, IDLE_MS);
	}

	function onScroll() {
		if (!scrollEl) return;
		const st = scrollEl.scrollTop;
		if (st !== lastScrollTop) lastDir = st > lastScrollTop ? 1 : -1;
		lastScrollTop = st;
		armIdle();
	}

	/**
	 * Read the settled selection and commit it; recenter the loop buffer. Gated on
	 * snap-alignment so we never commit/teleport mid-momentum (a momentum *pause*
	 * leaves scrollTop off the snap grid → re-arm and wait for true rest).
	 */
	function settle() {
		if (!scrollEl || n === 0) return;
		const raw = scrollEl.scrollTop;
		const snapped = Math.round(raw / itemHeight) * itemHeight;
		if (Math.abs(raw - snapped) > 1.5) {
			armIdle();
			return;
		}
		clearTimeout(idleTimer);
		pendingSmooth = false;
		userScrolling = false;

		const gi = centerGlobalIndex(raw, itemHeight);
		let real = realIndexFromGlobal(gi, n, loop);

		// Auto-skip a disabled landing by nudging to the nearest enabled row in the travel
		// direction. anchorTo() lands it in the home tile, so the buffer stays recentered.
		if (opts[real]?.disabled) {
			const target = nextEnabledIndex(real + lastDir, lastDir, opts, loop);
			if (target !== real && !opts[target]?.disabled) {
				anchorTo(target);
				commit(target);
				return;
			}
		}

		commit(real);

		// Recenter to the home tile (invisible: an exact whole-tile teleport leaves the
		// centered row and its value unchanged). drift becomes 0 afterwards → no recurse.
		if (loop) {
			const drift = driftTiles(gi, n, homeTile);
			if (drift !== 0) {
				scrollEl.scrollTop = raw - drift * tilePx;
				lastScrollTop = scrollEl.scrollTop;
			}
		}
	}

	/** Scroll so `realIndex` becomes selected. Keeps within the copy nearest the current
	 *  position (minimal/zero visible movement). Smooth unless instant/reduced-motion. */
	function scrollToIndex(realIndex: number, instant = false) {
		if (!scrollEl || n === 0) return;
		const r = loop ? mod(realIndex, n) : clamp(realIndex, 0, n - 1);
		let gi: number;
		if (loop) {
			// target the copy of `r` nearest the current position, so a wrap (59 -> 00)
			// advances one step in the natural direction instead of rewinding the long way.
			const curGi = centerGlobalIndex(scrollEl.scrollTop, itemHeight);
			gi = nearestGlobalIndex(curGi, r, n);
		} else {
			gi = r;
		}
		const targetTop = gi * itemHeight;
		// A zero-distance scroll fires no scroll/scrollend events. Commit directly and bail
		// (also covers Arrow/Home/End at a non-loop edge).
		if (Math.abs(scrollEl.scrollTop - targetTop) < 1) {
			commit(r);
			return;
		}
		// Coalesce rapid programmatic changes (e.g. a fast clock binding) to instant to
		// avoid animation pile-up; otherwise animate.
		const behavior: ScrollBehavior =
			instant || reducedMotion.current || pendingSmooth ? "instant" : "smooth";
		pendingSmooth = behavior === "smooth";
		commit(r);
		scrollEl.scrollTo({ top: targetTop, behavior });
		lastScrollTop = targetTop;
		// armIdle guarantees a settle() (clears pendingSmooth) even where `scrollend` is
		// unavailable (iOS < 26.2) or a smooth scroll's end event doesn't fire.
		armIdle();
	}

	function step(delta: number) {
		if (n === 0) return;
		const target = nextEnabledIndex(
			selectedIndex + delta,
			delta >= 0 ? 1 : -1,
			opts,
			loop
		);
		scrollToIndex(target);
	}

	function onKeydown(e: KeyboardEvent) {
		if (!keyboard || n === 0) return;
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				step(1);
				break;
			case "ArrowUp":
				e.preventDefault();
				step(-1);
				break;
			case "PageDown":
				e.preventDefault();
				step(vCount);
				break;
			case "PageUp":
				e.preventDefault();
				step(-vCount);
				break;
			case "Home":
				e.preventDefault();
				scrollToIndex(nextEnabledIndex(0, 1, opts, loop));
				break;
			case "End":
				e.preventDefault();
				scrollToIndex(nextEnabledIndex(n - 1, -1, opts, loop));
				break;
		}
	}

	// Init, re-anchor on geometry change, AND reconcile the committed selection when the
	// options array changes (shrinks/reorders). Structural deps only (incl. `opts` content);
	// `selectedIndex`/`value`/`index` are read untracked so a user commit or an external
	// value tick doesn't retrigger this (the separate reconcile effect owns that).
	$effect(() => {
		void scrollEl;
		void opts;
		void itemHeight;
		void vCount;
		void tiles;
		void loop;
		if (!scrollEl || n === 0) return;
		untrack(() => {
			if (!mounted) {
				// initial: skip a disabled target, position, and make value+index
				// authoritative from frame 1 (covers an unmatched/partial initial binding).
				const sel0 = nextEnabledIndex(clamp(selectedIndex, 0, n - 1), 1, opts, loop);
				selectedIndex = sel0;
				anchorTo(sel0);
				const opt = opts[sel0];
				if (opt) {
					value = opt.value;
					index = sel0;
				}
				mounted = true;
				return;
			}
			if (userScrolling) return; // don't disrupt an in-flight gesture; settle reconciles
			// reconcile a now-invalid committed selection (options shrank/reordered)
			const cur = opts[selectedIndex];
			const stillValid =
				selectedIndex < n && cur && (value === undefined || cur.value === value);
			if (!stillValid) {
				let cand = value !== undefined ? indexOfValue(opts, value) : -1;
				if (cand < 0) cand = clamp(selectedIndex, 0, n - 1);
				commit(nextEnabledIndex(cand, 1, opts, loop));
			}
			anchorTo(clamp(selectedIndex, 0, n - 1));
		});
	});

	// Reconcile external value/index changes (e.g. a clock binding). Deferred while the
	// user is actively scrolling; no-op when already in sync (prevents a commit→effect loop).
	$effect(() => {
		if (!mounted || !scrollEl || n === 0) return;
		let desired = -1;
		if (value !== undefined) {
			const i = indexOfValue(opts, value);
			if (i >= 0) desired = i;
		} else if (index !== undefined) {
			desired = clamp(index, 0, n - 1);
		}
		if (desired < 0 || desired === selectedIndex) return;
		if (untrack(() => userScrolling)) return;
		untrack(() => scrollToIndex(desired, reducedMotion.current));
	});

	// A listbox with no accessible name is a WCAG 4.1.2 failure for screen-reader users.
	$effect(() => {
		if (n > 0 && !label && !ariaLabel && !ariaLabelledby) {
			console.warn(
				"[WheelPicker] No `label` provided — the listbox has no accessible name for " +
					"screen readers. Pass `label` (or aria-label/aria-labelledby)."
			);
		}
	});

	$effect(() => {
		return () => clearTimeout(idleTimer);
	});

	let _class = $derived(unstyled ? classProp : twMerge("stuic-wheel-picker", classProp));
</script>

<div
	bind:this={el}
	class={_class}
	data-loop={!unstyled && loop ? "true" : undefined}
	style={unstyled
		? undefined
		: `--stuic-wheel-picker-item-height: ${itemHeight}px; --stuic-wheel-picker-visible-count: ${vCount};`}
	{...rest}
>
	<div
		bind:this={scrollEl}
		class={unstyled ? undefined : "stuic-wheel-picker-scroll"}
		role="listbox"
		tabindex={keyboard ? 0 : undefined}
		aria-label={label ?? ariaLabel}
		aria-labelledby={ariaLabelledby}
		aria-activedescendant={selectedOptionId}
		onscroll={onScroll}
		onscrollend={settle}
		onpointerdown={markUserScrolling}
		ontouchstart={markUserScrolling}
		onwheel={markUserScrolling}
		onkeydown={onKeydown}
	>
		<div
			class={unstyled ? undefined : "stuic-wheel-picker-spacer"}
			aria-hidden="true"
		></div>
		{#each rows as row (row.gi)}
			{@const selected = row.isHome && row.realIndex === selectedIndex}
			<div
				class={twMerge(
					!unstyled && "stuic-wheel-picker-item",
					classItem,
					selected && classItemSelected
				)}
				id={row.isHome ? optionId(row.realIndex) : undefined}
				role={row.isHome ? "option" : undefined}
				aria-hidden={row.isHome ? undefined : "true"}
				aria-selected={row.isHome ? (selected ? "true" : "false") : undefined}
				aria-disabled={row.option?.disabled ? "true" : undefined}
				data-selected={selected ? "true" : undefined}
				data-disabled={row.option?.disabled ? "true" : undefined}
				data-label={row.option?.label}
			>
				{#if renderItem}
					{@render renderItem({ option: row.option, index: row.realIndex, selected })}
				{:else}
					{row.option?.label}
				{/if}
			</div>
		{/each}
		<div
			class={unstyled ? undefined : "stuic-wheel-picker-spacer"}
			aria-hidden="true"
		></div>
	</div>

	{#if !unstyled}
		<div class={twMerge("stuic-wheel-picker-band", classBand)} aria-hidden="true"></div>
	{/if}

	{#if announce}
		<div class="stuic-wheel-picker-sr" aria-live="polite" aria-atomic="true">
			{announceText}
		</div>
	{/if}
</div>
