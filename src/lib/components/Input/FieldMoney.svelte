<!--
	FieldMoney — edit a money amount stored as INTEGER minor units.

	The bound `value` is the amount in minor units (e.g. cents); the visible input
	shows/accepts a major-unit decimal (e.g. "1.00"). Conversion uses `scale` /
	`decimals` (e.g. scale=100, decimals=2 for dollars/cents). Wraps FieldInput so
	you get the full label / description / validation / layout system for free.

	WHY a hidden input carries `name` (and the visible input stays name-less):
	a <form> serializes the live DOM. If the *visible* input held `name`, the form
	would submit the major-unit display string ("12.34") instead of the integer
	minor units the server expects, and whole values like "20.00" would parse to 20
	(minor units) — storing $0.20 for $20. So the visible input is kept name-less
	and a hidden input carries `name` + the already-converted INTEGER minor units.
	This mirrors FieldPhoneNumber, whose hidden input carries the composed E.164.
-->
<script lang="ts" module>
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { Props as FieldInputProps } from "./FieldInput.svelte";

	export interface Props extends Omit<
		FieldInputProps,
		"value" | "type" | "inputmode" | "min" | "max"
	> {
		/**
		 * Bound value in INTEGER minor units (e.g. cents). `null` / `undefined` /
		 * `""` mean empty. The visible input shows/accepts a major-unit decimal
		 * string (e.g. "1.00"); conversion uses `scale` / `decimals`.
		 */
		value?: number | string | null;
		/** Minor units per major unit. Default: 100 (cents per dollar/euro). */
		scale?: number;
		/** Fraction digits shown in the visible input. Default: 2. */
		decimals?: number;
		/**
		 * Form field name — applied to the hidden submit input carrying the integer
		 * minor units, NOT to the visible input. See the file header for why.
		 */
		name?: string;
		/** Optional minimum, in MAJOR units (e.g. `0` to forbid negatives). */
		min?: number;
		/** Optional maximum, in MAJOR units. */
		max?: number;
		/**
		 * Validation. `false` disables the built-in numeric guard; an options object
		 * is merged with it (your `customValidator` runs after the numeric/min/max
		 * checks pass). Defaults to the built-in guard.
		 */
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
	}
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import type { ValidationResult } from "../../actions/validate.svelte.js";
	import { formatMinorUnits, parseToMinorUnits } from "../../utils/money-units.js";
	import FieldInput from "./FieldInput.svelte";

	let {
		input = $bindable(),
		value = $bindable(),
		scale = 100,
		decimals = 2,
		name,
		min,
		max,
		validate: validateProp,
		...rest
	}: Props = $props();

	// Inner FieldInput instance — forwards the imperative ValidatableField API.
	let field: ReturnType<typeof FieldInput> | undefined = $state();

	const cfg = $derived({ scale, decimals });

	// Single source of truth for "is this a valid amount, and what number is it?".
	// A clean decimal is an optional leading "-", then digits with an optional
	// single dot ("12", "12.34", "12.", ".5", "-3.2"). Everything else is rejected
	// → null: hex ("0x10"), trailing garbage ("12.34abc"), thousands separators
	// ("1,234.56"), scientific ("1e3"). Both the value-sync path (toMinor) and the
	// validator below derive from THIS one helper, so what the validator accepts
	// and what the hidden input submits can never disagree (parseFloat alone would:
	// it reads "1,234.56" as 1 and "0x10" as 0, silently storing a wrong amount).
	const DECIMAL_RE = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
	const parseDecimal = (s: string): number | null => {
		const str = `${s}`.trim();
		return DECIMAL_RE.test(str) ? parseFloat(str) : null;
	};

	// Major-unit display string → integer minor units. Empty or non-numeric → null
	// (so a half-typed/garbage value is treated as "no amount", not silently 0).
	const toMinor = (s: string): number | null => {
		const n = parseDecimal(s);
		return n === null ? null : parseToMinorUnits(n, cfg);
	};

	// Integer minor units → major-unit display string ("" when empty).
	const fromValue = (v: number | string | null | undefined): string =>
		v === null || v === undefined || v === "" ? "" : formatMinorUnits(v, cfg);

	// Input-facing major-unit string (e.g. "1.00").
	let display = $state(fromValue(value));

	// Typing updates the bound minor-unit value.
	$effect(() => {
		const next = toMinor(display);
		untrack(() => {
			if (next !== (value ?? null)) value = next;
		});
	});

	// External value changes (model load/switch) resync the display — but only
	// when they don't already match what's typed, so we never clobber user input.
	$effect(() => {
		const incoming = value;
		untrack(() => {
			const incomingMinor =
				incoming === null || incoming === undefined || incoming === ""
					? null
					: Math.round(Number(incoming));
			if (toMinor(display) !== incomingMinor) display = fromValue(incoming);
		});
	});

	// What the form submits: INTEGER minor units derived straight from the visible
	// display string (empty/invalid → ""). Derived from `display` (not the bound
	// `value`) so it's correct synchronously at submit time, without depending on
	// the value-sync effect above having flushed first.
	const submitValue = $derived(toMinor(display) ?? "");

	// Built-in light numeric guard: reject a non-empty-but-non-numeric amount and
	// enforce optional major-unit min/max. `required`-empty is handled natively by
	// the visible input (FieldInput forwards `required`). Consumer opts are honored:
	// `false` disables; an options object is merged (its customValidator runs after
	// the numeric guard passes).
	const validateOpts = $derived.by<
		boolean | Omit<ValidateOptions, "setValidationResult">
	>(() => {
		if (validateProp === false) return false;
		const custom = validateProp && typeof validateProp === "object" ? validateProp : {};
		return {
			...custom,
			customValidator: (val, ctx, el) => {
				const str = `${val ?? ""}`.trim();
				if (str !== "") {
					const n = parseDecimal(str);
					if (n === null) return "Please enter a valid amount.";
					if (min != null && n < min) return `Amount must be at least ${min}.`;
					if (max != null && n > max) return `Amount must be at most ${max}.`;
				}
				return custom.customValidator?.(val, ctx, el) || "";
			},
		};
	});

	// ---- Imperative API (satisfies ValidatableField), forwarded to FieldInput ----

	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		return field?.validate();
	}

	/** Clear the inline validation message and reset `setCustomValidity`. */
	export function clearValidation(): void {
		field?.clearValidation();
	}

	/** Current validation state, or undefined if the validator has never run. */
	export function getValidation(): ValidationResult | undefined {
		return field?.getValidation();
	}

	/** Focus the visible input. */
	export function focus(): void {
		field?.focus();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		field?.scrollIntoView(opts);
	}
</script>

<FieldInput
	bind:this={field}
	bind:input
	type="text"
	inputmode="decimal"
	bind:value={display}
	validate={validateOpts}
	{...rest}
/>
<input type="hidden" {name} value={submitValue} />
