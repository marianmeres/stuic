<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { ColorPickerSwatch } from "./palettes.js";

	/**
	 * Which custom-color controls are rendered under the palette:
	 * - `"both"` (default) — the native picker button and the hex text field
	 * - `"native"` — only the native `<input type="color">` button
	 * - `"text"` — only the hex text field
	 * - `false` — none; the palette is the only source of values
	 */
	export type ColorPickerCustom = "both" | "native" | "text" | false;

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "onchange"
	> {
		/**
		 * Current color (bindable). Any CSS color string; `""` = no color. Stored
		 * verbatim — the component never converts between color spaces, so what a
		 * swatch holds is what you get back.
		 */
		value?: string;
		/**
		 * The swatches. Either bare CSS color strings or `{ value, label }` objects.
		 * Defaults to `COLOR_PICKER_PALETTE` (12 hues + white/grey/black); pass
		 * `COLOR_PICKER_PALETTE_THEME` for design-token colors, or `[]` for none.
		 */
		palette?: ColorPickerSwatch[];
		/**
		 * Cap the palette at this many swatches per row (a narrower container
		 * wraps to fewer rather than overflowing). Unset = as many as fit.
		 * ArrowUp / ArrowDown always step by the *rendered* row, whatever this is.
		 */
		columns?: number;
		/** Which custom-color controls to show (default `"both"`) */
		custom?: ColorPickerCustom;
		/**
		 * Offer clearing: a crossed-out swatch after the palette, plus Delete /
		 * Backspace, plus emptying the hex field — all setting `value` to `""`.
		 */
		allowClear?: boolean;
		/** Disable interaction (the hidden input is disabled too, so nothing submits) */
		disabled?: boolean;
		/** Accessible name of the swatch group (default `t("color")`, "Color") */
		label?: string;
		/** Form field name (hidden input) */
		name?: string;
		/** Require a non-empty value (enforced by the built-in validator) */
		required?: boolean;
		/** i18n translate function (see `createColorPickerT`) */
		t?: TranslateFn;
		/**
		 * Fires when the user commits a color: a swatch click / arrow key, the
		 * native picker's `change`, or the hex field on Enter or blur. NOT while
		 * the native picker is being dragged — `value` does update live there, so
		 * `bind:value` previews, but only the commit is an `onchange`.
		 */
		onchange?: (value: string) => void;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		setValidationResult?: (res: ValidationResult) => void;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for every swatch button */
		classSwatch?: string;
		/** Bindable root element reference */
		el?: HTMLDivElement;
		/** Bindable hidden input reference */
		inputEl?: HTMLInputElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import { isCssColor, isSameColor, normalizeHex } from "./color-value.js";
	import { COLOR_PICKER_PALETTE } from "./palettes.js";
	import { t_default } from "./i18n.js";

	let {
		value = $bindable(""),
		palette = COLOR_PICKER_PALETTE,
		columns,
		custom = "both",
		allowClear = true,
		disabled = false,
		label,
		name,
		required = false,
		t = t_default,
		onchange,
		validate: validateProp,
		setValidationResult,
		unstyled = false,
		class: classProp,
		classSwatch: classSwatchProp,
		el = $bindable(),
		inputEl = $bindable(),
		...rest
	}: Props = $props();

	let _value = $derived(typeof value === "string" ? value : "");

	// Normalized entries; empty/invalid ones are dropped so a swatch always has
	// something to paint.
	let _entries = $derived(
		(Array.isArray(palette) ? palette : [])
			.map((s) => (typeof s === "string" ? { value: s } : s))
			.filter((s) => !!s && typeof s.value === "string" && !!s.value.trim())
	);

	let _showNative = $derived(custom === "both" || custom === "native");
	let _showText = $derived(custom === "both" || custom === "text");

	let _cols = $derived(
		Number.isFinite(columns) && (columns as number) >= 1 ? Math.floor(columns!) : 0
	);

	// The clear swatch is the last member of the radio group (when enabled).
	let _navCount = $derived(_entries.length + (allowClear ? 1 : 0));
	let _selected = $derived.by(() => {
		if (allowClear && _value === "") return _entries.length;
		return _entries.findIndex((e) => isSameColor(e.value, _value));
	});

	/**
	 * Roving tabindex: the checked swatch is the single tab stop; with a custom
	 * (off-palette) color checked, nothing is — so fall back to the first one.
	 */
	function tabindexOf(i: number): 0 | -1 {
		if (_selected >= 0) return _selected === i ? 0 : -1;
		return i === 0 ? 0 : -1;
	}

	function labelOf(e: { value: string; label?: string }): string {
		return e.label ? t(e.label, null, e.label) : e.value;
	}

	// `<input type="color">` only accepts `#rrggbb`; anything else (a token
	// reference, `transparent`, an empty value) shows as black until picked.
	let _nativeValue = $derived(normalizeHex(_value) ?? "#000000");

	/**
	 * The hex field owns its own DOM value while it is focused — a half-typed
	 * "#3b" must survive the keystroke, and the value round-trip must not fight
	 * the caret. So it is written explicitly (`syncText`) rather than driven by a
	 * reactive `value=`: Svelte skips a write whenever the expression matches
	 * what it last wrote, which is exactly the snap-back-after-typing case.
	 */
	let textEl: HTMLInputElement | undefined = $state();

	/** Push the current value into the hex field, dropping whatever was typed. */
	function syncText(input?: HTMLInputElement | null) {
		const target = input ?? textEl;
		if (target && target.value !== _value) target.value = _value;
	}

	// ...which leaves the field to follow value changes made anywhere else (a
	// swatch, the native picker, the consumer) — but never under the caret.
	$effect(() => {
		void _value;
		if (textEl && document.activeElement !== textEl) syncText();
	});

	/** Accepts hex in any spelling, then any color the browser understands. */
	function parseColor(raw: string): string | null {
		const v = (raw ?? "").trim();
		if (!v) return allowClear ? "" : null;
		return normalizeHex(v) ?? (isCssColor(v) ? v : null);
	}

	/** Enter / blur in the hex field: commit it, or snap back if it is garbage. */
	function commitText(input: HTMLInputElement) {
		const parsed = parseColor(input.value);
		if (parsed === null) return syncText(input);
		commit(parsed);
		// show the normalized spelling ("#0f0" -> "#00ff00")
		input.value = parsed;
	}

	/**
	 * Live update, no event — the native picker's drag stream, and a valid color
	 * being typed into the hex field.
	 */
	function preview(v: string) {
		if (disabled) return;
		value = v;
	}

	/** A user commit: syncs the hidden input (revalidation) and fires `onchange`. */
	function commit(v: string) {
		if (disabled) return;
		value = v;
		// The hidden input's DOM value is only synced on the next flush, but the
		// validate action reads it synchronously in its "change" listener — so
		// write it by hand before dispatching. Svelte re-applies the same string
		// later (a no-op).
		if (inputEl) {
			inputEl.value = v;
			inputEl.dispatchEvent(new Event("change", { bubbles: true }));
		}
		onchange?.(v);
	}

	function valueAt(i: number): string {
		return i === _entries.length ? "" : (_entries[i]?.value ?? "");
	}

	/** Every group member, in DOM order (the clear swatch last). */
	function members(): HTMLElement[] {
		return [
			...(el?.querySelectorAll<HTMLElement>(`[role="radiogroup"] [data-index]`) ?? []),
		];
	}

	/**
	 * How many swatches actually share the top row right now. The palette wraps,
	 * so this — not the `columns` prop — is what ArrowUp / ArrowDown must step by:
	 * it stays true when a narrow screen wraps to fewer per row, and it gives the
	 * default (uncapped) palette working vertical arrows for free.
	 */
	function rowLength(): number {
		const nodes = members();
		if (nodes.length < 2) return 1;
		const top = nodes[0].offsetTop;
		let n = 0;
		while (n < nodes.length && nodes[n].offsetTop === top) n++;
		return n || 1;
	}

	function focusAt(i: number) {
		// keyed off the role, not the class — `unstyled` removes the classes
		el?.querySelector<HTMLButtonElement>(
			`[role="radiogroup"] [data-index="${i}"]`
		)?.focus();
	}

	/**
	 * Select the i-th group member. Re-picking the checked one is a no-op event-wise
	 * (a radio does not fire `change` when it is already the checked one), but it
	 * still moves focus — which is what arrow navigation needs.
	 */
	function pick(i: number) {
		if (i < 0 || i >= _navCount) return;
		if (i !== _selected) commit(valueAt(i));
		focusAt(i);
	}

	function onkeydown(e: KeyboardEvent) {
		if (disabled || !_navCount) return;
		const from = Number((e.target as HTMLElement)?.dataset?.index);
		const cur = Number.isFinite(from) ? from : Math.max(_selected, 0);
		const step = rowLength();
		let next: number;
		switch (e.key) {
			// Horizontal wraps (radiogroup convention), vertical does not — a
			// wrapped row has no meaningful cell above the first one.
			case "ArrowRight":
				next = (cur + 1) % _navCount;
				break;
			case "ArrowLeft":
				next = (cur - 1 + _navCount) % _navCount;
				break;
			case "ArrowDown":
				next = cur + step;
				if (next >= _navCount) return;
				break;
			case "ArrowUp":
				next = cur - step;
				if (next < 0) return;
				break;
			case "Home":
				next = 0;
				break;
			case "End":
				next = _navCount - 1;
				break;
			case "Delete":
			case "Backspace":
				if (!allowClear) return;
				e.preventDefault();
				// already cleared -> handled, but nothing changed (no event)
				if (_value !== "") commit("");
				return;
			default:
				return;
		}
		e.preventDefault();
		pick(next);
	}

	let _class = $derived(unstyled ? classProp : twMerge("stuic-color-picker", classProp));
	let _classSwatch = $derived(
		unstyled ? classSwatchProp : twMerge("stuic-color-picker-swatch", classSwatchProp)
	);

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
	data-disabled={!unstyled && disabled ? "" : undefined}
	{...rest}
>
	{#if _navCount}
		<!-- The group is a composite widget with a roving tabindex: the checked
		     swatch is the tab stop, never the container. Making the container
		     focusable would add a second stop and let a click on the gap between
		     swatches pull focus off them. -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			class={unstyled ? undefined : "stuic-color-picker-swatches"}
			role="radiogroup"
			aria-label={label || t("color", null, "Color")}
			aria-required={required ? "true" : undefined}
			aria-disabled={disabled ? "true" : undefined}
			aria-invalid={_validation && !_validation.valid ? "true" : undefined}
			data-columns={!unstyled && _cols ? _cols : undefined}
			style={_cols ? `--stuic-color-picker-columns: ${_cols};` : undefined}
			{onkeydown}
		>
			{#each _entries as entry, i (entry.value + "-" + i)}
				<button
					type="button"
					role="radio"
					class={_classSwatch}
					style="--stuic-color-picker-swatch-color: {entry.value};"
					data-index={i}
					data-selected={!unstyled && _selected === i ? "" : undefined}
					aria-checked={_selected === i}
					aria-label={labelOf(entry)}
					title={labelOf(entry)}
					tabindex={tabindexOf(i)}
					{disabled}
					onclick={() => pick(i)}
				></button>
			{/each}
			{#if allowClear}
				{@const i = _entries.length}
				<button
					type="button"
					role="radio"
					class={_classSwatch}
					data-index={i}
					data-clear={!unstyled ? "" : undefined}
					data-selected={!unstyled && _selected === i ? "" : undefined}
					aria-checked={_selected === i}
					aria-label={t("no_color", null, "No color")}
					title={t("no_color", null, "No color")}
					tabindex={tabindexOf(i)}
					{disabled}
					onclick={() => pick(i)}
				></button>
			{/if}
		</div>
	{/if}

	{#if _showNative || _showText}
		<div class={unstyled ? undefined : "stuic-color-picker-custom"}>
			{#if _showNative}
				<input
					type="color"
					class={unstyled ? undefined : "stuic-color-picker-native"}
					value={_nativeValue}
					{disabled}
					aria-label={t("custom_color", null, "Custom color")}
					title={t("custom_color", null, "Custom color")}
					oninput={(e) => preview(e.currentTarget.value)}
					onchange={(e) => commit(e.currentTarget.value)}
				/>
			{/if}
			{#if _showText}
				<input
					bind:this={textEl}
					type="text"
					class={unstyled ? undefined : "stuic-color-picker-text"}
					value={_value}
					{disabled}
					autocomplete="off"
					autocapitalize="none"
					autocorrect="off"
					spellcheck="false"
					inputmode="text"
					placeholder={t("hex_placeholder", null, "#rrggbb")}
					aria-label={t("hex_value", null, "Hex value")}
					oninput={(e) => {
						const parsed = parseColor(e.currentTarget.value);
						// preview only — the commit (and `onchange`) waits for
						// Enter / blur, so a partial value never fires an event
						if (parsed !== null) preview(parsed);
					}}
					onchange={(e) => commitText(e.currentTarget)}
					onblur={(e) => syncText(e.currentTarget)}
				/>
			{/if}
		</div>
	{/if}

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
					if (required && !String(val ?? "").trim()) {
						return t("required", null, "Please select a color");
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
</div>
