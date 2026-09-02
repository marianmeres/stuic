<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { IntentColorKey } from "../../utils/design-tokens.js";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";

	export type RatingSize = "sm" | "md" | "lg";

	/** Fill state of one symbol (its `data-state`). */
	export type RatingItemState = "full" | "partial" | "empty";

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		| "children"
		| "onchange"
		// Reserved by the rating's own keyboard / hover machinery (compile-time
		// guard against silently clobbering them via the rest spread).
		| "onkeydown"
		| "onpointerleave"
	> {
		/**
		 * Current value (bindable), 0 = no rating. Rendered clamped to `[0, max]`;
		 * in input mode also snapped to whole (or, with `allowHalf`, half) symbols.
		 * Display mode (`readonly`) renders any fraction (4.2 → a 20% fifth star).
		 */
		value?: number;
		/** Number of symbols (default 5; integer ≥ 1) */
		max?: number;
		/** Allow half-symbol values (each symbol gets two hit zones) */
		allowHalf?: boolean;
		/**
		 * Clicking the currently selected symbol (or pressing Delete / Backspace)
		 * resets the value to 0 (default true).
		 */
		allowClear?: boolean;
		/**
		 * Display variant: no interaction, no form participation, fractional
		 * values rendered as-is. The root becomes `role="img"` with an accessible
		 * "{value} of {max} stars" label.
		 */
		readonly?: boolean;
		/** Disable interaction (the hidden input is disabled too, so nothing submits) */
		disabled?: boolean;
		/** Symbol size preset (default "md"); `--stuic-rating-size` overrides any preset */
		size?: RatingSize;
		/**
		 * Semantic color of the filled symbols. Unset (default) uses the fixed
		 * "star amber" (`--stuic-rating-icon-color`) regardless of theme.
		 */
		intent?: IntentColorKey;
		/**
		 * Raw svg/html string of the filled symbol (e.g. an `@marianmeres/icons-fns`
		 * render result). Default: a filled star. Fill-based icons work best — the
		 * fill layer is clipped to the value, so the symbol must draw with
		 * `currentColor`.
		 */
		icon?: string;
		/** Raw svg/html string of the empty symbol (default: same as `icon`, muted) */
		iconEmpty?: string;
		/**
		 * Accessible name of the control (default `t("rating")`, "Rating"). In
		 * `readonly` mode it prefixes the value announcement.
		 */
		label?: string;
		/** Form field name (hidden input; input mode only) */
		name?: string;
		/** Require a non-zero value (enforced by the built-in validator) */
		required?: boolean;
		/** i18n translate function (see `createRatingT`) */
		t?: TranslateFn;
		/** Fires when the user changes the value (click, keyboard, clear) */
		onchange?: (value: number) => void;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		setValidationResult?: (res: ValidationResult) => void;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for every symbol wrapper */
		classItem?: string;
		/** Class for the icon stack inside each symbol */
		classIcon?: string;
		/** Bindable root element reference */
		el?: HTMLDivElement;
		/** Bindable hidden input reference (input mode only) */
		inputEl?: HTMLInputElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import { iconStarFill } from "../../icons/index.js";
	import { t_default } from "./i18n.js";

	let {
		value = $bindable(0),
		max = 5,
		allowHalf = false,
		allowClear = true,
		readonly = false,
		disabled = false,
		size = "md",
		intent,
		icon,
		iconEmpty,
		label,
		name,
		required = false,
		t = t_default,
		onchange,
		validate: validateProp,
		setValidationResult,
		unstyled = false,
		class: classProp,
		classItem: classItemProp,
		classIcon: classIconProp,
		el = $bindable(),
		inputEl = $bindable(),
		...rest
	}: Props = $props();

	const DEFAULT_ICON = iconStarFill();

	let _max = $derived(Number.isFinite(max) && max >= 1 ? Math.floor(max) : 5);
	let _step = $derived(allowHalf ? 0.5 : 1);

	// The rendered (and submitted) value: clamped, and snapped to the step grid
	// in input mode. External writes are NOT normalized back into the binding —
	// what the consumer wrote stays theirs until the user interacts.
	let _value = $derived.by(() => {
		if (!Number.isFinite(value)) return 0;
		const clamped = Math.min(Math.max(0, value), _max);
		return readonly ? clamped : Math.round(clamped / _step) * _step;
	});

	let _interactive = $derived(!readonly && !disabled);

	// Pointer hover preview (input mode only)
	let _hover: number | null = $state(null);
	let _display = $derived(_hover ?? _value);

	let _icon = $derived(icon || DEFAULT_ICON);
	let _iconEmpty = $derived(iconEmpty || _icon);

	let _items = $derived(Array.from({ length: _max }, (_, i) => i + 1));

	// Hit zones per symbol: one (whole) or two (half + whole)
	function zonesOf(i: number): number[] {
		return allowHalf ? [i - 0.5, i] : [i];
	}

	/** 0..1 fill ratio of the i-th (1-based) symbol for the displayed value */
	function fillOf(i: number): number {
		return Math.min(Math.max(_display - (i - 1), 0), 1);
	}

	function stateOf(fill: number): RatingItemState {
		if (fill >= 1) return "full";
		if (fill <= 0) return "empty";
		return "partial";
	}

	// Format numbers without float noise (2.5, not 2.5000000000000004)
	function fmt(n: number): string {
		return String(Math.round(n * 100) / 100);
	}

	function valueText(v: number): string {
		return t("value_of_max", { value: fmt(v), max: _max });
	}

	let _class = $derived(unstyled ? classProp : twMerge("stuic-rating", classProp));
	let _classItem = $derived(
		unstyled ? classItemProp : twMerge("stuic-rating-item", classItemProp)
	);
	let _classIcon = $derived(
		unstyled ? classIconProp : twMerge("stuic-rating-icon", classIconProp)
	);

	// Roving tabindex: the selected zone is the tab stop (the first one when
	// nothing is selected), arrows move between the others.
	function tabindexOf(v: number, first: boolean): 0 | -1 {
		if (_value === v) return 0;
		return _value === 0 && first ? 0 : -1;
	}

	function commit(v: number, toggle = false) {
		if (!_interactive) return;
		const next = toggle && allowClear && v === _value ? 0 : v;
		if (next === _value) return;
		value = next;
		// The hidden input's DOM value is only synced on the next flush, but the
		// validate action reads it synchronously in its "change" listener — so
		// write it by hand before dispatching. Svelte re-applies the same string
		// later (a no-op).
		if (inputEl) {
			inputEl.value = String(next);
			inputEl.dispatchEvent(new Event("change", { bubbles: true }));
		}
		onchange?.(next);
	}

	function focusZone(v: number) {
		el?.querySelector<HTMLButtonElement>(`[data-value="${fmt(v)}"]`)?.focus();
	}

	function onkeydown(e: KeyboardEvent) {
		if (!_interactive) return;
		let next: number;
		switch (e.key) {
			case "ArrowRight":
			case "ArrowUp":
				next = Math.min(_max, _value + _step);
				break;
			case "ArrowLeft":
			case "ArrowDown":
				next = Math.max(_step, _value - _step);
				break;
			case "Home":
				next = _step;
				break;
			case "End":
				next = _max;
				break;
			case "Delete":
			case "Backspace":
				if (!allowClear) return;
				next = 0;
				break;
			default:
				return;
		}
		e.preventDefault();
		commit(next);
		if (next > 0) focusZone(next);
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
		inputEl?.setCustomValidity?.("");
	}

	/** Current validation state. */
	export function getValidation(): ValidationResult | undefined {
		return _validation;
	}
</script>

<div
	bind:this={el}
	class={_class}
	role={readonly ? "img" : "radiogroup"}
	aria-label={readonly
		? [label, valueText(_value)].filter(Boolean).join(", ")
		: label || t("rating", null, "Rating")}
	aria-required={!readonly && required ? "true" : undefined}
	aria-disabled={!readonly && disabled ? "true" : undefined}
	aria-invalid={_validation && !_validation.valid ? "true" : undefined}
	data-size={!unstyled ? size : undefined}
	data-intent={!unstyled ? intent : undefined}
	data-readonly={!unstyled && readonly ? "" : undefined}
	data-disabled={!unstyled && disabled ? "" : undefined}
	data-hover={!unstyled && _hover !== null ? "" : undefined}
	{onkeydown}
	onpointerleave={() => (_hover = null)}
	{...rest}
>
	{#each _items as i (i)}
		{@const fill = fillOf(i)}
		<span
			class={_classItem}
			style="--stuic-rating-fill: {Math.round(fill * 100)}%"
			data-state={!unstyled ? stateOf(fill) : undefined}
			data-hover={!unstyled && _hover !== null && Math.ceil(_hover) === i
				? ""
				: undefined}
		>
			<span class={_classIcon} aria-hidden="true">
				<span class={unstyled ? undefined : "stuic-rating-icon-empty"}>
					{@html _iconEmpty}
				</span>
				<span class={unstyled ? undefined : "stuic-rating-icon-fill"}>
					{@html _icon}
				</span>
			</span>
			{#if !readonly}
				{#each zonesOf(i) as v, zi (v)}
					<button
						type="button"
						role="radio"
						class={unstyled ? undefined : "stuic-rating-zone"}
						data-value={fmt(v)}
						data-half={!unstyled && allowHalf ? (zi === 0 ? "start" : "end") : undefined}
						aria-checked={_value === v}
						aria-label={valueText(v)}
						tabindex={tabindexOf(v, i === 1 && zi === 0)}
						{disabled}
						onclick={(e) => commit(v, e.detail !== 0)}
						onpointerenter={() => {
							if (_interactive) _hover = v;
						}}
					></button>
				{/each}
			{/if}
		</span>
	{/each}
	{#if !readonly}
		<input
			bind:this={inputEl}
			type="hidden"
			{name}
			value={_value}
			{disabled}
			use:validateAction={() => {
				const customOpts =
					typeof validateProp === "object" && validateProp ? validateProp : {};
				const userValidator = customOpts.customValidator;
				return {
					enabled: validateProp !== false,
					...customOpts,
					// Hidden inputs are barred from native constraint validation, so
					// `required` is enforced here, then the consumer's validator runs.
					customValidator(val, ctx, input) {
						if (required && !(Number(val) > 0)) {
							return t("required", null, "Please select a rating");
						}
						return userValidator?.(val, ctx, input) || "";
					},
					setValidationResult: (res) => {
						_validation = res;
						setValidationResult?.(res);
					},
					setDoValidate: (fn) => (_doValidate = fn),
				};
			}}
		/>
	{/if}
</div>
