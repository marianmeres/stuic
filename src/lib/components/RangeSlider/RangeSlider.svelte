<!--
	RangeSlider — the dual-thumb sibling of `Slider`: two values (`start` ≤ `end`) on
	one track, the fill spanning the selected range. Price filters, "between" queries,
	min/max limits.

	Same construction as Slider: the root owns the pointer machinery (nearest thumb
	jumps to a track press, grabbing a thumb drags it without a jump, thumbs never
	cross), while two visually hidden native `<input type="range">` — one per thumb,
	each covering its half of the track — provide keyboard interaction, the slider
	roles for assistive tech, and form participation (`nameStart` / `nameEnd`).
-->
<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";

	export type RangeSliderIntent =
		"primary" | "accent" | "success" | "warning" | "destructive";

	export type RangeSliderOrientation = "horizontal" | "vertical";

	/** One of the two thumbs: `start` carries the lower value, `end` the upper one. */
	export type RangeSliderThumb = "start" | "end";

	/** The value pair — payload of `oninput` / `onchange` and of `validate.customValidator`. */
	export interface RangeSliderValue {
		start: number;
		end: number;
	}

	/** Context passed to the `thumb` and `valueLabel` snippets (rendered once per thumb). */
	export interface RangeSliderRenderCtx {
		/** The thumb this render is for */
		thumb: RangeSliderThumb;
		/** This thumb's value */
		value: number;
		/** Normalized position of this thumb, 0..1 */
		ratio: number;
		/** Normalized position of this thumb, 0..100 */
		percent: number;
		/** Whether this thumb is being dragged */
		dragging: boolean;
		/** Current lower value */
		start: number;
		/** Current upper value */
		end: number;
	}

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		| "children"
		| "oninput"
		| "onchange"
		// Reserved by the slider's own drag machinery (compile-time guard against
		// silently clobbering them via the rest spread).
		| "onpointerdown"
		| "onpointermove"
		| "onpointerup"
		| "onpointercancel"
	> {
		/**
		 * Lower value (bindable). Defaults to `min`. Non-finite, out-of-range and
		 * off-step-grid writes are normalized back into the binding, a reversed pair
		 * is reordered and `minRange` is enforced — so the bound values always equal
		 * what is rendered and submitted.
		 */
		start?: number;
		/** Upper value (bindable). Defaults to `max` (or the last step-grid point below it). */
		end?: number;
		min?: number;
		max?: number;
		/**
		 * Snap increment. Use "any" for continuous (no snapping). Non-positive
		 * numbers are treated as "any".
		 */
		step?: number | "any";
		/**
		 * Minimum distance between the two values — the thumbs can never get closer
		 * than this. Rounded up onto the step grid and capped at the reachable span;
		 * `0` (default) lets the thumbs coincide.
		 */
		minRange?: number;
		orientation?: RangeSliderOrientation;
		/** Cross-axis thickness preset (main-axis length via `--stuic-range-slider-length` or class) */
		size?: "sm" | "md" | "lg" | string;
		/** Semantic color intent (colors the fill) */
		intent?: RangeSliderIntent;
		disabled?: boolean;
		/** Accessible name of the whole control (the root is a labelled `group`) */
		label?: string;
		/** Accessible name of the start (lower) thumb. Defaults to `t("minimum")` — "Minimum". */
		labelStart?: string;
		/** Accessible name of the end (upper) thumb. Defaults to `t("maximum")` — "Maximum". */
		labelEnd?: string;
		/** Form field name of the hidden range input carrying `start` */
		nameStart?: string;
		/** Form field name of the hidden range input carrying `end` */
		nameEnd?: string;
		/** Skip all default styling, use only custom classes */
		unstyled?: boolean;
		class?: string;
		/** Classes for the track (pill background) element */
		trackClass?: string;
		/** Classes for the fill (selected range) element */
		fillClass?: string;
		/** Classes for both thumb elements */
		thumbClass?: string;
		/** Classes for each tick mark element */
		tickClass?: string;
		/** Classes for both floating value label wrappers */
		valueClass?: string;
		/**
		 * Thumb rendering: `true` (default) renders two empty thumbs, `false` hides
		 * them (fill-only look), a snippet renders custom content inside each thumb
		 * (its context says which one).
		 */
		thumb?: boolean | Snippet<[RangeSliderRenderCtx]>;
		/**
		 * Round the fill's edges (instead of flat cuts), giving the "pill inside a
		 * pill" look.
		 */
		fillRounded?: boolean;
		/**
		 * Tick marks along the track: `true` renders one at every `step` (requires a
		 * positive numeric step; auto ticks are skipped above 101 — pass an explicit
		 * array instead), an array renders them at the given (in-range) values.
		 */
		ticks?: boolean | number[];
		/** Floating value label per thumb (tracks the thumb along the track, outside it) */
		valueLabel?: Snippet<[RangeSliderRenderCtx]>;
		/** Bindable root element reference */
		el?: HTMLDivElement;
		/** Bindable reference of the hidden range input carrying `start` */
		inputStartEl?: HTMLInputElement;
		/** Bindable reference of the hidden range input carrying `end` */
		inputEndEl?: HTMLInputElement;
		/** Fires on every actual value change (dragging, keyboard), with the thumb that moved */
		oninput?: (value: RangeSliderValue, thumb: RangeSliderThumb) => void;
		/** Fires when a changed value is committed (drag released, keyboard), with the thumb that moved */
		onchange?: (value: RangeSliderValue, thumb: RangeSliderThumb) => void;
		/**
		 * Validation (the stuic `validate` action, attached to the start input and
		 * re-run on every commit of either thumb). NOTE: `customValidator` receives
		 * the `{ start, end }` pair as its value, not a DOM string.
		 */
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		setValidationResult?: (res: ValidationResult) => void;
		/** i18n of the default thumb names (see `createRangeSliderT`) */
		t?: TranslateFn;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import { t_default } from "./i18n.js";

	let {
		start = $bindable(),
		end = $bindable(),
		min = 0,
		max = 100,
		step = 1,
		minRange = 0,
		orientation = "horizontal",
		size = "md",
		intent,
		disabled,
		label,
		labelStart,
		labelEnd,
		nameStart,
		nameEnd,
		unstyled = false,
		class: classProp,
		trackClass,
		fillClass,
		thumbClass,
		tickClass,
		valueClass,
		thumb = true,
		fillRounded = false,
		ticks,
		valueLabel,
		el = $bindable(),
		inputStartEl = $bindable(),
		inputEndEl = $bindable(),
		oninput,
		onchange,
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
		setValidationResult,
		t = t_default,
		...rest
	}: Props = $props();

	const MAX_AUTO_TICKS = 100;
	const EPS = 1e-9;

	// The thumb being dragged (null between drags — and during the brief "which
	// thumb?" limbo of a press on two stacked thumbs, which the first move's
	// direction resolves).
	let _dragThumb = $state<RangeSliderThumb | null>(null);
	let _pending = false;
	// Active press pointer (ignore other concurrent pointers), where it landed
	// (main-axis px from the value=min end) and whether that was on a thumb.
	let _pointerId: number | null = null;
	let _pressPos = 0;
	let _pressOnStart = false;
	let _pressOnEnd = false;
	// Main-axis px offset between the grab point and the dragged thumb's center,
	// so grabbing a thumb off-center does not jump the value.
	let _grabOffset = 0;
	// Value at drag start — commit (change) fires only if the drag changed it.
	let _dragStartValue = 0;
	// The thumb last dragged or focused: rendered above the other one.
	let _activeThumb = $state<RangeSliderThumb | null>(null);

	// Rendered thumbs reserve their footprint at both ends of the track: the values
	// map onto the thumb-center travel, so the fill can never shrink below one
	// thumb (coinciding thumbs leave exactly a thumb-sized nub). No thumbs maps
	// linearly across the whole track and lets the fill collapse to zero.
	let _thumbReserved = $derived(thumb !== false);

	// Bounds must be finite before anything else: a NaN bound would make every
	// normalization write NaN, and NaN !== NaN would re-trigger the effect below
	// forever (Svelte sources compare with ===) — an app-killing update-depth error.
	let _rawMin = $derived(Number.isFinite(min) ? min : 0);
	let _rawMax = $derived(Number.isFinite(max) ? max : 100);
	let _min = $derived(Math.min(_rawMin, _rawMax));
	let _max = $derived(Math.max(_rawMin, _rawMax));
	let _span = $derived(_max - _min);
	// The hidden inputs must never receive an invalid step (the browser would fall
	// back to step=1 and re-sanitize values the JS side left continuous).
	let _stepAttr = $derived(typeof step === "number" && step > 0 ? step : "any");
	/** Largest reachable value: `max`, or the last step-grid point below it. */
	let _ceil = $derived(_snap(_max));
	/** `minRange` rounded up onto the step grid and capped at the reachable span. */
	let _gap = $derived.by(() => {
		if (!(typeof minRange === "number" && Number.isFinite(minRange) && minRange > 0)) {
			return 0;
		}
		let g = minRange;
		if (typeof step === "number" && step > 0) g = Math.ceil(g / step - EPS) * step;
		return _trim(Math.min(g, _ceil - _min));
	});

	// Normalize the bindings: undefined/non-finite become `min` / `max`, out-of-range
	// is clamped, off-grid is snapped, a reversed pair is reordered and `minRange`
	// enforced — so the bound values always match what is rendered AND what the
	// hidden inputs hold (the browser sanitizes off-grid values onto the step grid,
	// which would otherwise diverge silently).
	$effect(() => {
		const [s, e] = _normalize(start, end);
		if (!Object.is(start, s)) start = s;
		if (!Object.is(end, e)) end = e;
	});

	let _pair = $derived(_normalize(start, end));
	let _start = $derived(_pair[0]);
	let _end = $derived(_pair[1]);
	let _ratioStart = $derived(_span ? (_start - _min) / _span : 0);
	let _ratioEnd = $derived(_span ? (_end - _min) / _span : 0);
	/** Midpoint between the thumbs (0..1) — where the two hidden inputs split the track. */
	let _mid = $derived((_ratioStart + _ratioEnd) / 2);

	let _ctxStart: RangeSliderRenderCtx = $derived({
		thumb: "start",
		value: _start,
		ratio: _ratioStart,
		percent: _ratioStart * 100,
		dragging: _dragThumb === "start",
		start: _start,
		end: _end,
	});
	let _ctxEnd: RangeSliderRenderCtx = $derived({
		thumb: "end",
		value: _end,
		ratio: _ratioEnd,
		percent: _ratioEnd * 100,
		dragging: _dragThumb === "end",
		start: _start,
		end: _end,
	});

	function _clamp(v: number): number {
		if (!Number.isFinite(v)) return _min;
		return Math.min(Math.max(v, _min), _max);
	}

	function _decimals(n: number): number {
		const s = String(Math.abs(n));
		const e = s.indexOf("e");
		if (e === -1) {
			const i = s.indexOf(".");
			return i === -1 ? 0 : s.length - i - 1;
		}
		// Exponential notation (e.g. "1e-7", "1.5e-7")
		const exp = Number(s.slice(e + 1));
		const mant = s.slice(0, e);
		const mi = mant.indexOf(".");
		const mantDec = mi === -1 ? 0 : mant.length - mi - 1;
		return Math.max(0, mantDec - exp);
	}

	/** Trim floating point noise (e.g. 0.1 + 0.2) to the precision of `step` / `min`. */
	function _trim(v: number): number {
		if (!(typeof step === "number" && step > 0)) return v;
		const decimals = Math.min(Math.max(_decimals(step), _decimals(_min)), 20);
		return Number(v.toFixed(decimals));
	}

	/**
	 * Snap to the step grid (anchored at `min`). Values beyond the last reachable
	 * grid point resolve to that grid point — NOT to an off-grid `max` — matching
	 * the browser's own range value sanitization (so the hidden inputs never
	 * re-sanitize to a different number than the bound value).
	 */
	function _snap(v: number): number {
		if (!(typeof step === "number" && step > 0)) return _clamp(v);
		let snapped = _min + Math.round((v - _min) / step) * step;
		if (snapped > _max) snapped = _min + Math.floor(_span / step + EPS) * step;
		if (snapped < _min) snapped = _min;
		return _trim(snapped);
	}

	/**
	 * The canonical pair for any input: both finite, in range and on-grid, ordered
	 * (a reversed pair is swapped) and at least `_gap` apart — the end is pushed up,
	 * or, at the ceiling, the start pushed down.
	 */
	function _normalize(s: number | undefined, e: number | undefined): [number, number] {
		let a = s === undefined || !Number.isFinite(s) ? _min : _snap(s);
		let b = e === undefined || !Number.isFinite(e) ? _ceil : _snap(e);
		if (a > b) [a, b] = [b, a];
		if (b - a < _gap - EPS) {
			b = _snap(a + _gap);
			if (b - a < _gap - EPS) a = _snap(b - _gap);
		}
		return [a, b];
	}

	function _valueOf(which: RangeSliderThumb): number {
		return which === "start" ? _start : _end;
	}

	function _ratioOf(which: RangeSliderThumb): number {
		return which === "start" ? _ratioStart : _ratioEnd;
	}

	function _inputOf(which: RangeSliderThumb): HTMLInputElement | undefined {
		return which === "start" ? inputStartEl : inputEndEl;
	}

	/** Thumbs never cross and stay `_gap` apart: a thumb stops at the other one. */
	function _limit(which: RangeSliderThumb, v: number): number {
		return which === "start"
			? Math.min(v, _snap(_end - _gap))
			: Math.max(v, _snap(_start + _gap));
	}

	/**
	 * Sync the hidden inputs synchronously (Svelte's template update is async and
	 * skips entirely when a bound parent nets the value back to what it was — and
	 * the browser lets each input roam the whole min..max on its own).
	 */
	function _syncInputs() {
		for (const which of ["start", "end"] as const) {
			const input = _inputOf(which);
			const s = String(_valueOf(which));
			if (input && input.value !== s) input.value = s;
		}
	}

	function _apply(which: RangeSliderThumb, v: number) {
		v = _limit(which, v);
		const prev = _valueOf(which);
		if (v === prev) return;
		if (which === "start") start = v;
		else end = v;
		// Re-read through the derived: a bound parent may have transformed or
		// rejected the write synchronously.
		const current = _valueOf(which);
		_syncInputs();
		if (current !== prev) oninput?.({ start: _start, end: _end }, which);
	}

	interface Geometry {
		horizontal: boolean;
		rtl: boolean;
		rect: DOMRect;
		trackLen: number;
		/** Dead zone at each end of the track (half the thumb size incl. inset) */
		pad: number;
		/** Usable px distance the values map onto */
		travel: number;
	}

	function _geometry(): Geometry {
		const rect = el!.getBoundingClientRect();
		const horizontal = orientation === "horizontal";
		const rtl = horizontal && getComputedStyle(el!).direction === "rtl";
		const trackLen = horizontal ? rect.width : rect.height;
		const thickness = horizontal ? rect.height : rect.width;
		// With thumbs the values map onto [thickness/2, len - thickness/2] (mirrors
		// the CSS `(100% - thickness) * ratio` sizing/positioning); without them
		// linearly across the whole track. NOTE: this assumes the rendered cross-axis
		// size equals --_thickness — size the cross-axis via the size presets or
		// --stuic-range-slider-thickness, not via utility classes (see README).
		const pad = _thumbReserved ? thickness / 2 : 0;
		const travel = Math.max(1, trackLen - 2 * pad);
		return { horizontal, rtl, rect, trackLen, pad, travel };
	}

	/** Pointer position in track coords, measured from the value=min end. */
	function _pointerPos(e: PointerEvent, g: Geometry): number {
		if (!g.horizontal) return g.rect.bottom - e.clientY;
		return g.rtl ? g.rect.right - e.clientX : e.clientX - g.rect.left;
	}

	function _posToValue(e: PointerEvent, g: Geometry): number {
		const r = (_pointerPos(e, g) - _grabOffset - g.pad) / g.travel;
		return _snap(_min + r * _span);
	}

	/** Main-axis px position of a thumb's center. */
	function _center(which: RangeSliderThumb, g: Geometry): number {
		return g.pad + g.travel * _ratioOf(which);
	}

	function _beginDrag(which: RangeSliderThumb, e: PointerEvent, g: Geometry) {
		_pending = false;
		_dragThumb = which;
		_activeThumb = which;
		_dragStartValue = _valueOf(which);
		// Grabbing (near) a thumb must not jump the value — the drag continues from
		// the grab point.
		const grabbed = which === "start" ? _pressOnStart : _pressOnEnd;
		_grabOffset = grabbed ? _pressPos - _center(which, g) : 0;
		_apply(which, _posToValue(e, g));
		_focusThumb(which);
	}

	function _endPress(e: PointerEvent) {
		_dragThumb = null;
		_pending = false;
		_pointerId = null;
		if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
	}

	function _onpointerdown(e: PointerEvent) {
		// Disabled inputs cannot take focus, so there is no pointer-initiated focus
		// to suppress a ring for — and a flag left behind would hide the ring from
		// the first keyboard focus after re-enabling.
		if (disabled) return;
		// Set before the remaining early-returns: any pointer press over the
		// component means the focus that follows is pointer-initiated and must not
		// show the ring (a right-click still focuses one of the hidden inputs).
		_pointerFocus = true;
		if (_pointerId !== null || e.button !== 0) return;
		e.preventDefault();
		const g = _geometry();
		const pos = _pointerPos(e, g);
		const dStart = Math.abs(pos - _center("start", g));
		const dEnd = Math.abs(pos - _center("end", g));
		// Grab detection is geometric (the hidden inputs are the topmost hit targets,
		// so DOM-target checks would never match a thumb element).
		_pressPos = pos;
		_pressOnStart = _thumbReserved && dStart <= g.pad;
		_pressOnEnd = _thumbReserved && dEnd <= g.pad;
		try {
			el?.setPointerCapture(e.pointerId);
		} catch {
			// NotFoundError for a pointerId that is not actively down (synthetic
			// events) — capture is an optimization here, the drag works without it.
		}
		_pointerId = e.pointerId;
		if (dStart < dEnd) _beginDrag("start", e, g);
		else if (dEnd < dStart) _beginDrag("end", e, g);
		else if (!_pressOnStart && !_pressOnEnd) {
			// Equidistant, off both thumbs — they sit on top of each other and the
			// press is beside them: the thumb on that side jumps (towards max → end).
			_beginDrag(pos >= _center("end", g) ? "end" : "start", e, g);
		} else {
			// Equidistant ON the thumbs (stacked on each other): nothing can move
			// without guessing, so the first move's direction picks the thumb
			// (towards max → end, towards min → start). The end input gets focus
			// meanwhile so the keyboard still has a slider.
			_pending = true;
			_focusThumb("end");
		}
	}

	function _onpointermove(e: PointerEvent) {
		if (e.pointerId !== _pointerId) return;
		if (disabled) return _endPress(e);
		const g = _geometry();
		if (_pending) {
			const pos = _pointerPos(e, g);
			if (pos === _pressPos) return;
			_beginDrag(pos > _pressPos ? "end" : "start", e, g);
			return;
		}
		if (_dragThumb) _apply(_dragThumb, _posToValue(e, g));
	}

	function _onpointerup(e: PointerEvent) {
		if (e.pointerId !== _pointerId) return;
		const wasDisabled = disabled;
		const which = _dragThumb;
		_endPress(e);
		if (wasDisabled || !which) return;
		// Native "change" (commit) semantics — only when the drag actually changed
		// the value. Also triggers the validate action and the `onchange` handler
		// on the hidden input below.
		if (_valueOf(which) !== _dragStartValue) {
			_inputOf(which)?.dispatchEvent(new Event("change", { bubbles: true }));
		}
	}

	let _tickRatios = $derived.by(() => {
		if (!ticks || !_span) return [];
		let vals: number[];
		if (Array.isArray(ticks)) {
			vals = ticks;
		} else if (typeof step === "number" && step > 0) {
			const count = Math.floor(_span / step + EPS);
			if (count > MAX_AUTO_TICKS) {
				console.warn(
					`[stuic] RangeSlider: ${count + 1} auto ticks exceed the limit of ${MAX_AUTO_TICKS + 1}, ` +
						`skipping (pass an explicit \`ticks\` array instead)`
				);
				return [];
			}
			// Through _snap so float accumulation (0 + 3 * 0.1 = 0.30000000000000004)
			// cannot push the last tick past _max and drop it.
			vals = Array.from({ length: count + 1 }, (_, i) => _snap(_min + i * step));
		} else {
			return [];
		}
		return [...new Set(vals)]
			.filter((v) => v >= _min && v <= _max)
			.map((v) => (v - _min) / _span);
	});

	// Styled mode renders three complementary tick layers — clipped to the part of
	// the track before the fill, to the fill, and after it — so ticks stay readable
	// over both the track and the fill. `unstyled` has no CSS to clip them, so it
	// gets the single plain layer.
	let _tickLayers = $derived<(string | undefined)[]>(
		unstyled ? [undefined] : ["before", "on-fill", "after"]
	);

	// Deterministic, cross-browser focus ring: shown for keyboard-initiated focus
	// only (:focus-visible leaks on pointer-initiated programmatic focus in
	// Chromium/WebKit). Holds the focused thumb, so the ring can sit on it.
	let _ring = $state<RangeSliderThumb | null>(null);
	let _pointerFocus = false;
	// A programmatic focus hop between the two inputs is in progress: the blur it
	// triggers must not reset `_pointerFocus` before the focus reads it.
	let _hopping = false;

	function _focusThumb(which: RangeSliderThumb) {
		const input = _inputOf(which);
		if (!input || document.activeElement === input) return;
		_pointerFocus = true;
		_hopping = true;
		try {
			input.focus();
		} finally {
			_hopping = false;
		}
	}

	function _onfocus(which: RangeSliderThumb) {
		_ring = _pointerFocus ? null : which;
		_pointerFocus = false;
		_activeThumb = which;
	}

	function _onblur() {
		_ring = null;
		if (!_hopping) _pointerFocus = false;
	}

	function _oninput(
		which: RangeSliderThumb,
		e: Event & { currentTarget: HTMLInputElement }
	) {
		const v = e.currentTarget.valueAsNumber;
		if (!Number.isNaN(v)) _apply(which, v);
		// The native step landed past the other thumb (or a bound parent rejected
		// the write): pull the input back to the value actually held.
		_syncInputs();
	}

	function _onchange(which: RangeSliderThumb) {
		onchange?.({ start: _start, end: _end }, which);
		// The validate action listens on the start input only.
		if (which === "end") _doValidate?.();
	}

	//
	let _doValidate: (() => void) | undefined = $state();
	// Local copy of the last validation result so getValidation() works even
	// when no external setValidationResult was provided.
	let _validation: ValidationResult | undefined = $state();

	/** Trigger validation now. Reaches the parent via `setValidationResult`. */
	export function validate(): ValidationResult | undefined {
		_doValidate?.();
		return _validation;
	}

	/** Clear the inline validation message and reset `setCustomValidity`. */
	export function clearValidation(): void {
		_validation = undefined;
		inputStartEl?.setCustomValidity?.("");
	}

	/** Current validation state. */
	export function getValidation(): ValidationResult | undefined {
		return _validation;
	}

	/** Focus the start thumb's range input. */
	export function focus(): void {
		inputStartEl?.focus?.();
	}

	/** Scroll the slider into view. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		el?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}
</script>

{#snippet thumbEl(ctx: RangeSliderRenderCtx)}
	<div class={twMerge("thumb", thumbClass)} data-thumb={ctx.thumb} aria-hidden="true">
		{#if typeof thumb === "function"}
			{@render thumb(ctx)}
		{/if}
	</div>
{/snippet}

{#snippet valueEl(ctx: RangeSliderRenderCtx)}
	<div class={twMerge("value", valueClass)} data-thumb={ctx.thumb} aria-hidden="true">
		{@render valueLabel?.(ctx)}
	</div>
{/snippet}

<!-- `rest` is spread first intentionally: the pointer handlers and computed
     attributes below are functionally required and must not be clobbered.
     `data-stuic-range-slider` is always emitted (even when `unstyled`) — index.css
     hangs the FUNCTIONAL declarations off it (touch-action, position, the hidden
     inputs' hit areas, …) so dragging survives `unstyled`, while staying
     attribute-specificity so a consumer utility class can still override it. -->
<div
	{...rest}
	bind:this={el}
	class={unstyled ? classProp : twMerge("stuic-range-slider", classProp)}
	style:--_ratio-start={_ratioStart}
	style:--_ratio-end={_ratioEnd}
	style:--_mid={_mid}
	role="group"
	aria-label={label}
	data-stuic-range-slider=""
	data-orientation={orientation}
	data-thumbs={_thumbReserved ? "true" : "false"}
	data-fill-rounded={fillRounded ? "true" : undefined}
	data-size={!unstyled ? size : undefined}
	data-intent={!unstyled ? intent : undefined}
	data-disabled={disabled ? "true" : undefined}
	data-dragging={_dragThumb ?? undefined}
	data-active-thumb={_activeThumb ?? undefined}
	data-ring={_ring ?? undefined}
	onpointerdown={_onpointerdown}
	onpointermove={_onpointermove}
	onpointerup={_onpointerup}
	onpointercancel={_onpointerup}
>
	<div class={twMerge("track", trackClass)}>
		<div class={twMerge("fill", fillClass)}></div>
		{#if _tickRatios.length}
			{#each _tickLayers as layer (layer)}
				<div class="ticks" data-layer={layer} aria-hidden="true">
					{#each _tickRatios as r (r)}
						<div class={twMerge("tick", tickClass)} style:--_tick-ratio={r}></div>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
	{#if thumb !== false}
		{@render thumbEl(_ctxStart)}
		{@render thumbEl(_ctxEnd)}
	{/if}
	{#if valueLabel}
		{@render valueEl(_ctxStart)}
		{@render valueEl(_ctxEnd)}
	{/if}
	<!-- Visually hidden but sized (index.css): each input covers the track from
	     its end up to the midpoint between the thumbs, so touch-based assistive
	     tech (VoiceOver / TalkBack explore-by-touch) hit-tests a real slider role
	     on the side of the thumb it belongs to. Pointer events bubble to the root
	     handler, which preventDefault()s the native drag behavior. -->
	<input
		bind:this={inputStartEl}
		type="range"
		data-thumb="start"
		value={_start}
		min={_min}
		max={_max}
		step={_stepAttr}
		name={nameStart}
		{disabled}
		aria-label={labelStart ?? t("minimum", null, "Minimum")}
		aria-orientation={orientation === "vertical" ? "vertical" : undefined}
		onfocus={() => _onfocus("start")}
		onblur={_onblur}
		onkeydown={() => (_ring = "start")}
		oninput={(e) => _oninput("start", e)}
		onchange={() => _onchange("start")}
		use:validateAction={() => {
			const opts = typeof validateProp === "object" ? validateProp : {};
			const custom = opts.customValidator;
			return {
				enabled: validateProp !== false,
				...opts,
				// The pair is the value — the DOM string of one input is useless alone.
				customValidator: custom
					? (_v, ctx, input) => custom({ start: _start, end: _end }, ctx, input)
					: undefined,
				setValidationResult: (res) => {
					_validation = res;
					setValidationResult?.(res);
				},
				setDoValidate: (fn) => (_doValidate = fn),
			};
		}}
	/>
	<input
		bind:this={inputEndEl}
		type="range"
		data-thumb="end"
		value={_end}
		min={_min}
		max={_max}
		step={_stepAttr}
		name={nameEnd}
		{disabled}
		aria-label={labelEnd ?? t("maximum", null, "Maximum")}
		aria-orientation={orientation === "vertical" ? "vertical" : undefined}
		onfocus={() => _onfocus("end")}
		onblur={_onblur}
		onkeydown={() => (_ring = "end")}
		oninput={(e) => _oninput("end", e)}
		onchange={() => _onchange("end")}
	/>
</div>
