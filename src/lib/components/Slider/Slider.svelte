<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";

	export type SliderIntent = "primary" | "accent" | "success" | "warning" | "destructive";

	export type SliderOrientation = "horizontal" | "vertical";

	export type SliderThumbPosition = "value" | "start";

	/** Context passed to the `thumb` and `valueLabel` snippets. */
	export interface SliderRenderCtx {
		value: number;
		/** Normalized value position, 0..1 */
		ratio: number;
		/** Normalized value position, 0..100 */
		percent: number;
		dragging: boolean;
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
		 * Current value (bindable). Defaults to `min`. Non-finite, out-of-range and
		 * off-step-grid writes are normalized back into the binding, so the bound
		 * value always equals what is rendered and submitted.
		 */
		value?: number;
		min?: number;
		max?: number;
		/**
		 * Snap increment. Use "any" for continuous (no snapping). Non-positive
		 * numbers are treated as "any".
		 */
		step?: number | "any";
		orientation?: SliderOrientation;
		/** Cross-axis thickness preset (main-axis length via `--stuic-slider-length` or class) */
		size?: "sm" | "md" | "lg" | string;
		/** Semantic color intent (colors the fill) */
		intent?: SliderIntent;
		disabled?: boolean;
		/** Screen reader label for the underlying range input */
		label?: string;
		/** Id for the underlying range input (enables `<label for>` association) */
		id?: string;
		/** Form field name for the hidden range input */
		name?: string;
		/**
		 * Forwarded to the hidden range input. NOTE: per HTML spec `required` has
		 * no effect on range inputs (they always have a value) — use
		 * `validate.customValidator` for custom rules.
		 */
		required?: boolean;
		/** Skip all default styling, use only custom classes */
		unstyled?: boolean;
		class?: string;
		/** Classes for the track (pill background) element */
		trackClass?: string;
		/** Classes for the fill (value indicator) element */
		fillClass?: string;
		/** Classes for the thumb element */
		thumbClass?: string;
		/** Classes for each tick mark element */
		tickClass?: string;
		/** Classes for the floating value label wrapper */
		valueClass?: string;
		/**
		 * Thumb rendering: `true` (default) renders an empty thumb, `false` hides it
		 * (fill-only look), a snippet renders custom content inside the thumb.
		 */
		thumb?: boolean | Snippet<[SliderRenderCtx]>;
		/**
		 * Where the thumb sits: `"value"` (default) rides the fill edge, `"start"`
		 * pins it to the start of the track (left / bottom) so only the bar moves —
		 * the true iOS volume look with a fixed icon.
		 */
		thumbPosition?: SliderThumbPosition;
		/**
		 * Round the fill's leading edge (instead of a flat cut), giving the
		 * "pill inside a pill" look.
		 */
		fillRounded?: boolean;
		/**
		 * Tick marks along the track: `true` renders one at every `step` (requires a
		 * positive numeric step; auto ticks are skipped above 101 — pass an explicit
		 * array instead), an array renders them at the given (in-range) values.
		 */
		ticks?: boolean | number[];
		/** Floating current-value label (tracks the value along the track, outside it) */
		valueLabel?: Snippet<[SliderRenderCtx]>;
		/** Bindable root element reference */
		el?: HTMLDivElement;
		/** Bindable hidden range input reference */
		inputEl?: HTMLInputElement;
		/** Fires on every actual value change (dragging, keyboard) */
		oninput?: (value: number) => void;
		/** Fires when a changed value is committed (drag released, keyboard) */
		onchange?: (value: number) => void;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		setValidationResult?: (res: ValidationResult) => void;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";

	let {
		value = $bindable(),
		min = 0,
		max = 100,
		step = 1,
		orientation = "horizontal",
		size = "md",
		intent,
		disabled,
		label,
		id,
		name,
		required,
		unstyled = false,
		class: classProp,
		trackClass,
		fillClass,
		thumbClass,
		tickClass,
		valueClass,
		thumb = true,
		thumbPosition = "value",
		fillRounded = false,
		ticks,
		valueLabel,
		el = $bindable(),
		inputEl = $bindable(),
		oninput,
		onchange,
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
		setValidationResult,
		...rest
	}: Props = $props();

	const MAX_AUTO_TICKS = 100;

	let _dragging = $state(false);
	// Active drag pointer (ignore other concurrent pointers) and the main-axis px
	// offset between the grab point and the thumb center, so grabbing the thumb
	// off-center does not jump the value.
	let _pointerId: number | null = null;
	let _grabOffset = 0;
	// Value at drag start — commit (change) fires only if the drag changed it.
	let _dragStartValue = 0;

	// Only a value-tracking thumb insets the usable travel; a start-pinned thumb
	// (or none) lets the fill map linearly across the whole track.
	let _thumbTravels = $derived(thumb !== false && thumbPosition === "value");

	// Bounds must be finite before anything else: a NaN bound would make every
	// normalization write NaN, and NaN !== NaN would re-trigger the effect below
	// forever (Svelte sources compare with ===) — an app-killing update-depth error.
	let _rawMin = $derived(Number.isFinite(min) ? min : 0);
	let _rawMax = $derived(Number.isFinite(max) ? max : 100);
	let _min = $derived(Math.min(_rawMin, _rawMax));
	let _max = $derived(Math.max(_rawMin, _rawMax));
	let _span = $derived(_max - _min);
	// The hidden input must never receive an invalid step (the browser would fall
	// back to step=1 and re-sanitize values the JS side left continuous).
	let _stepAttr = $derived(typeof step === "number" && step > 0 ? step : "any");

	// Normalize the binding: undefined/non-finite becomes `min`, out-of-range is
	// clamped, off-grid is snapped — so the bound value always matches what is
	// rendered AND what the hidden input holds (the browser sanitizes off-grid
	// values onto the step grid, which would otherwise diverge silently).
	$effect(() => {
		const next = _normalize(value);
		if (!Object.is(value, next)) value = next;
	});

	let _value = $derived(_normalize(value));
	let _ratio = $derived(_span ? (_value - _min) / _span : 0);
	let _ctx: SliderRenderCtx = $derived({
		value: _value,
		ratio: _ratio,
		percent: _ratio * 100,
		dragging: _dragging,
	});

	function _clamp(v: number): number {
		if (!Number.isFinite(v)) return _min;
		return Math.min(Math.max(v, _min), _max);
	}

	/** The canonical value for any input: always finite, in range, and on-grid. */
	function _normalize(v: number | undefined): number {
		if (v === undefined || !Number.isFinite(v)) return _min;
		return _snap(v);
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

	/**
	 * Snap to the step grid (anchored at `min`). Values beyond the last reachable
	 * grid point resolve to that grid point — NOT to an off-grid `max` — matching
	 * the browser's own range value sanitization (so the hidden input never
	 * re-sanitizes to a different number than the bound value).
	 */
	function _snap(v: number): number {
		if (!(typeof step === "number" && step > 0)) return _clamp(v);
		let snapped = _min + Math.round((v - _min) / step) * step;
		if (snapped > _max) snapped = _min + Math.floor(_span / step + 1e-9) * step;
		if (snapped < _min) snapped = _min;
		// Trim floating point noise (e.g. 0.1 + 0.2)
		const decimals = Math.min(Math.max(_decimals(step), _decimals(_min)), 20);
		return Number(snapped.toFixed(decimals));
	}

	interface Geometry {
		horizontal: boolean;
		rtl: boolean;
		rect: DOMRect;
		trackLen: number;
		/** Dead zone at each end of the track (half the thumb size incl. inset) */
		pad: number;
		/** Usable px distance the value maps onto */
		travel: number;
	}

	function _geometry(): Geometry {
		const rect = el!.getBoundingClientRect();
		const horizontal = orientation === "horizontal";
		const rtl = horizontal && getComputedStyle(el!).direction === "rtl";
		const trackLen = horizontal ? rect.width : rect.height;
		const thickness = horizontal ? rect.height : rect.width;
		// With a thumb, the thumb center travels within [thickness/2, len - thickness/2]
		// (mirrors the CSS `(100% - thickness) * ratio` positioning); without it, the
		// value maps linearly across the whole track. NOTE: this assumes the rendered
		// cross-axis size equals --_thickness — size the cross-axis via the size
		// presets or --stuic-slider-thickness, not via utility classes (see README).
		const pad = _thumbTravels ? thickness / 2 : 0;
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

	function _apply(v: number) {
		const prev = _value;
		if (v === prev) return;
		value = v;
		// Re-read through the derived: a bound parent may have transformed or
		// rejected the write synchronously.
		const current = _value;
		// Sync the hidden input synchronously (Svelte's template update is async
		// and skips entirely when the parent nets the value back to what it was).
		if (inputEl && inputEl.value !== String(current)) inputEl.value = String(current);
		if (current !== prev) oninput?.(current);
	}

	function _endDrag(e: PointerEvent) {
		_dragging = false;
		_pointerId = null;
		if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
	}

	function _onpointerdown(e: PointerEvent) {
		// Set before the early-returns: any pointer press over the component means
		// the focus that follows is pointer-initiated and must not show the ring
		// (a right-click still focuses the full-size hidden input).
		_pointerFocus = true;
		if (disabled || _dragging || e.button !== 0) return;
		e.preventDefault();
		const g = _geometry();
		const pos = _pointerPos(e, g);
		// Grabbing (near) the thumb must not jump the value — detected geometrically
		// (the full-size hidden input is the topmost hit target, so DOM-target
		// checks would never match the thumb element).
		const thumbCenter = g.pad + g.travel * _ratio;
		_grabOffset =
			_thumbTravels && Math.abs(pos - thumbCenter) <= g.pad ? pos - thumbCenter : 0;
		try {
			el?.setPointerCapture(e.pointerId);
		} catch {
			// NotFoundError for a pointerId that is not actively down (synthetic
			// events) — capture is an optimization here, the drag works without it.
		}
		_pointerId = e.pointerId;
		_dragging = true;
		_dragStartValue = _value;
		_apply(_posToValue(e, g));
		inputEl?.focus();
	}

	function _onpointermove(e: PointerEvent) {
		if (!_dragging || e.pointerId !== _pointerId) return;
		if (disabled) return _endDrag(e);
		_apply(_posToValue(e, _geometry()));
	}

	function _onpointerup(e: PointerEvent) {
		if (!_dragging || e.pointerId !== _pointerId) return;
		const wasDisabled = disabled;
		_endDrag(e);
		if (wasDisabled) return;
		// Native "change" (commit) semantics — only when the drag actually changed
		// the value. Also triggers the validate action and the `onchange` handler
		// on the hidden input below.
		if (_value !== _dragStartValue) {
			inputEl?.dispatchEvent(new Event("change", { bubbles: true }));
		}
	}

	let _tickRatios = $derived.by(() => {
		if (!ticks || !_span) return [];
		let vals: number[];
		if (Array.isArray(ticks)) {
			vals = ticks;
		} else if (typeof step === "number" && step > 0) {
			const count = Math.floor(_span / step + 1e-9);
			if (count > MAX_AUTO_TICKS) {
				console.warn(
					`[stuic] Slider: ${count + 1} auto ticks exceed the limit of ${MAX_AUTO_TICKS + 1}, ` +
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

	// Deterministic, cross-browser focus ring: shown for keyboard-initiated focus
	// only (:focus-visible leaks on pointer-initiated programmatic focus in
	// Chromium/WebKit).
	let _showRing = $state(false);
	let _pointerFocus = false;

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
		inputEl?.setCustomValidity?.("");
	}

	/** Current validation state. */
	export function getValidation(): ValidationResult | undefined {
		return _validation;
	}

	/** Focus the underlying range input. */
	export function focus(): void {
		inputEl?.focus?.();
	}

	/** Scroll the slider into view. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		el?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}
</script>

<!-- `rest` is spread first intentionally: the pointer handlers and computed
     attributes below are functionally required and must not be clobbered.
     `data-stuic-slider` is always emitted (even when `unstyled`) — index.css
     hangs the FUNCTIONAL declarations off it (touch-action, position, …) so
     dragging survives `unstyled`, while staying attribute-specificity so a
     consumer utility class can still override it. -->
<div
	{...rest}
	bind:this={el}
	class={unstyled ? classProp : twMerge("stuic-slider", classProp)}
	style:--_ratio={_ratio}
	data-stuic-slider=""
	data-orientation={orientation}
	data-thumb={thumb !== false ? "true" : "false"}
	data-thumb-position={thumb !== false ? thumbPosition : undefined}
	data-thumb-travels={_thumbTravels ? "true" : "false"}
	data-fill-rounded={fillRounded ? "true" : undefined}
	data-size={!unstyled ? size : undefined}
	data-intent={!unstyled ? intent : undefined}
	data-disabled={disabled ? "true" : undefined}
	data-dragging={_dragging ? "true" : undefined}
	data-ring={_showRing ? "true" : undefined}
	onpointerdown={_onpointerdown}
	onpointermove={_onpointermove}
	onpointerup={_onpointerup}
	onpointercancel={_onpointerup}
>
	<div class={twMerge("track", trackClass)}>
		<div class={twMerge("fill", fillClass)}></div>
		{#if _tickRatios.length}
			<!-- Styled mode renders two complementary layers — the base one clipped
			     to the unfilled part of the track, the `on-fill` one to the filled
			     part — so ticks stay readable over both. `unstyled` has no CSS to
			     clip them, so it gets the single plain layer. -->
			{#each unstyled ? [false] : [false, true] as onFill}
				<div class="ticks" data-on-fill={onFill ? "true" : undefined} aria-hidden="true">
					{#each _tickRatios as r}
						<div class={twMerge("tick", tickClass)} style:--_tick-ratio={r}></div>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
	{#if thumb !== false}
		<div class={twMerge("thumb", thumbClass)} aria-hidden="true">
			{#if typeof thumb === "function"}
				{@render thumb(_ctx)}
			{/if}
		</div>
	{/if}
	{#if valueLabel}
		<div class={twMerge("value", valueClass)} aria-hidden="true">
			{@render valueLabel(_ctx)}
		</div>
	{/if}
	<!-- Visually hidden but full-size, so touch-based assistive tech (VoiceOver /
	     TalkBack explore-by-touch) can hit-test the real slider role. Pointer
	     events bubble to the root handler, which preventDefault()s the native
	     drag behavior. -->
	<input
		bind:this={inputEl}
		type="range"
		class="absolute inset-0 size-full opacity-0"
		value={_value}
		min={_min}
		max={_max}
		step={_stepAttr}
		{id}
		{name}
		{required}
		{disabled}
		aria-label={label}
		aria-orientation={orientation === "vertical" ? "vertical" : undefined}
		onfocus={() => {
			_showRing = !_pointerFocus;
			_pointerFocus = false;
		}}
		onblur={() => {
			_showRing = false;
			_pointerFocus = false;
		}}
		onkeydown={() => (_showRing = true)}
		oninput={(e) => {
			const t = e.currentTarget;
			const v = t.valueAsNumber;
			if (!Number.isNaN(v) && v !== value) {
				const prev = _value;
				value = v;
				if (_value !== prev) oninput?.(_value);
			}
			// Resync the DOM in case a bound parent transformed/rejected the write
			// (the template update skips when the parent nets the value back).
			if (t.value !== String(_value)) t.value = String(_value);
		}}
		onchange={(e) => {
			const v = e.currentTarget.valueAsNumber;
			if (!Number.isNaN(v)) onchange?.(v);
		}}
		use:validateAction={() => ({
			enabled: validateProp !== false,
			...(typeof validateProp === "boolean" ? {} : validateProp),
			setValidationResult: (res) => {
				_validation = res;
				setValidationResult?.(res);
			},
			setDoValidate: (fn) => (_doValidate = fn),
		})}
	/>
</div>
